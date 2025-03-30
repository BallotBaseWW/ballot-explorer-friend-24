
import { ExtractedSignature, ValidationResult } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type VoterTable = "bronx" | "brooklyn" | "manhattan" | "queens" | "statenisland";
type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

export async function extractSignaturesFromFiles(files: File[]): Promise<ExtractedSignature[]> {
  const extractedSignatures: ExtractedSignature[] = [];
  
  try {
    toast.info("Analyzing petition pages", {
      description: "Processing documents with AI signature detection"
    });
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const pageNumber = i + 1;
      
      // Prepare form data for the edge function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('page_number', pageNumber.toString());
      
      toast.info(`Processing page ${pageNumber}`, {
        description: "Using AI to detect signatures"
      });
      
      try {
        console.log(`Calling edge function for page ${pageNumber}...`);
        
        // Call the edge function
        const { data, error } = await supabase.functions.invoke('extract-signatures', {
          body: formData,
        });
        
        if (error) {
          console.error('Error calling extract-signatures:', error);
          toast.error(`Error processing page ${pageNumber}`, {
            description: error.message
          });
          continue;
        }
        
        console.log('Edge function response:', data);
        
        if (data && data.signatures && Array.isArray(data.signatures)) {
          // Add signatures to the collection
          extractedSignatures.push(...data.signatures);
          console.log(`Added ${data.signatures.length} signatures from page ${pageNumber}`);
        } else {
          console.warn('Unexpected response format from extract-signatures:', data);
          toast.warning(`No signatures found on page ${pageNumber}`, {
            description: "The AI couldn't detect any valid signatures on this page"
          });
        }
      } catch (err) {
        console.error('Exception calling extract-signatures:', err);
        toast.error(`Error processing page ${pageNumber}`, {
          description: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
    
    if (extractedSignatures.length === 0) {
      toast.error("No signatures detected", {
        description: "The AI couldn't detect any signatures in the uploaded documents"
      });
    } else {
      toast.success(`Detected ${extractedSignatures.length} signatures`, {
        description: "Processing complete"
      });
    }
    
    return extractedSignatures;
  } catch (error) {
    console.error("Error extracting signatures:", error);
    toast.error("Error processing petition files", {
      description: "Could not extract signatures from the uploaded documents"
    });
    return [];
  }
}

async function findMatchingVoter(name: string, address: string): Promise<VoterRecord | null> {
  try {
    // Improved name parsing
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    
    console.log(`Looking for voter with name: ${firstName} ${lastName}`);
    
    // Determine which borough to search based on address
    let tableToQuery: VoterTable = "statenisland"; // Default to Staten Island
    
    if (address.toLowerCase().includes('staten island') || 
        address.toLowerCase().includes('statenisland') || 
        address.toLowerCase().includes('staten is') || 
        address.match(/\b(si|s\.i\.)\b/i)) {
      tableToQuery = "statenisland";
      console.log('Searching in Staten Island voter records');
    } else if (address.toLowerCase().includes('brooklyn') || address.toLowerCase().includes('kings')) {
      tableToQuery = "brooklyn";
      console.log('Searching in Brooklyn voter records');
    } else if (address.toLowerCase().includes('bronx')) {
      tableToQuery = "bronx";
      console.log('Searching in Bronx voter records');
    } else if (address.toLowerCase().includes('queens')) {
      tableToQuery = "queens";
      console.log('Searching in Queens voter records');
    } else if (address.toLowerCase().includes('manhattan') || 
               address.toLowerCase().includes('new york, ny') || 
               address.toLowerCase().includes('new york,ny')) {
      tableToQuery = "manhattan";
      console.log('Searching in Manhattan voter records');
    } else {
      // If no borough is specified, look at zip code
      const zipMatch = address.match(/\b\d{5}(?:-\d{4})?\b/);
      if (zipMatch) {
        const zip = zipMatch[0].substring(0, 5);
        console.log(`Detected ZIP code: ${zip}`);
        
        // Staten Island: 10301-10314
        if (zip >= '10301' && zip <= '10314') {
          tableToQuery = "statenisland";
          console.log('ZIP code indicates Staten Island');
        }
        // Brooklyn: 11201-11256
        else if (zip >= '11201' && zip <= '11256') {
          tableToQuery = "brooklyn";
          console.log('ZIP code indicates Brooklyn');
        }
        // Manhattan: 10001-10282
        else if (zip >= '10001' && zip <= '10282') {
          tableToQuery = "manhattan";
          console.log('ZIP code indicates Manhattan');
        }
        // Bronx: 10451-10475
        else if (zip >= '10451' && zip <= '10475') {
          tableToQuery = "bronx";
          console.log('ZIP code indicates Bronx');
        }
        // Queens: 11351-11697
        else if (zip >= '11351' && zip <= '11697') {
          tableToQuery = "queens";
          console.log('ZIP code indicates Queens');
        }
      }
    }
    
    // Extract street address and number for more precise matching
    const streetInfo = extractStreetInfo(address);
    console.log('Extracted street info:', streetInfo);
    
    // Perform fuzzy search with more relaxed criteria
    let query = supabase
      .from(tableToQuery)
      .select()
      .limit(5); // Get up to 5 potential matches
    
    // Add name filtering if we have valid names
    if (firstName.length > 1) {
      query = query.ilike('first_name', `${firstName}%`);
    }
    
    if (lastName.length > 1) {
      query = query.ilike('last_name', `${lastName}%`);
    }
    
    // Add street name filtering if available
    if (streetInfo.streetName && streetInfo.streetName.length > 3) {
      query = query.ilike('street_name', `%${streetInfo.streetName}%`);
    }
    
    // Add house number filtering if available
    if (streetInfo.houseNumber) {
      query = query.eq('house', streetInfo.houseNumber);
    }
    
    // Execute the query with timeout set to 1 minute
    const { data, error } = await query;
    
    if (error) {
      console.error('Error finding matching voter:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No matches found with strict criteria, trying broader search');
      
      // Try a broader search if no results found
      const { data: broadData, error: broadError } = await supabase
        .from(tableToQuery)
        .select()
        .or(`first_name.ilike.${firstName}%,last_name.ilike.${lastName}%`)
        .limit(5);
      
      if (broadError) {
        console.error('Error in broader voter search:', broadError);
        return null;
      }
      
      if (!broadData || broadData.length === 0) {
        console.log('No matches found even with broader criteria');
        return null;
      }
      
      console.log(`Found ${broadData.length} potential matches with broader criteria`);
      return getBestMatch(broadData, firstName, lastName, streetInfo);
    }
    
    console.log(`Found ${data.length} potential matches`);
    return getBestMatch(data, firstName, lastName, streetInfo);
  } catch (error) {
    console.error('Error in findMatchingVoter:', error);
    return null;
  }
}

// Helper function to extract street information from an address
function extractStreetInfo(address: string): { houseNumber?: string; streetName?: string } {
  try {
    // Remove apartment/unit numbers which can confuse the parsing
    const cleanedAddress = address.replace(/apt\.?\s*\d+|unit\s*\d+|#\s*\d+/i, '').trim();
    
    // Try to match house number and street name
    const match = cleanedAddress.match(/^(\d+(?:-\d+)?)\s+([^,]+)/i);
    
    if (match) {
      return {
        houseNumber: match[1],
        streetName: match[2].replace(/\b(street|st|avenue|ave|road|rd|boulevard|blvd|place|pl|lane|ln|drive|dr|court|ct|parkway|pkwy|way)\b/i, '').trim()
      };
    }
    
    return {};
  } catch (e) {
    console.error('Error extracting street info:', e);
    return {};
  }
}

// Helper function to get the best match from potential matches
function getBestMatch(
  potentialMatches: VoterRecord[], 
  firstName: string, 
  lastName: string, 
  streetInfo: { houseNumber?: string; streetName?: string }
): VoterRecord | null {
  if (potentialMatches.length === 0) return null;
  
  // If we only have one match, return it
  if (potentialMatches.length === 1) return potentialMatches[0];
  
  // Score each potential match
  const scoredMatches = potentialMatches.map(voter => {
    let score = 0;
    
    // Name matching (case insensitive)
    if (voter.first_name?.toLowerCase() === firstName.toLowerCase()) score += 3;
    else if (voter.first_name?.toLowerCase().startsWith(firstName.toLowerCase())) score += 2;
    
    if (voter.last_name?.toLowerCase() === lastName.toLowerCase()) score += 3;
    else if (voter.last_name?.toLowerCase().startsWith(lastName.toLowerCase())) score += 2;
    
    // Address matching
    if (streetInfo.houseNumber && voter.house === streetInfo.houseNumber) score += 3;
    
    if (streetInfo.streetName && voter.street_name) {
      const voterStreet = voter.street_name.toLowerCase();
      const signatureStreet = streetInfo.streetName.toLowerCase();
      
      if (voterStreet === signatureStreet) score += 3;
      else if (voterStreet.includes(signatureStreet) || signatureStreet.includes(voterStreet)) score += 2;
    }
    
    return { voter, score };
  });
  
  // Sort by score (highest first)
  scoredMatches.sort((a, b) => b.score - a.score);
  
  // Log the top match for debugging
  console.log('Best match score:', scoredMatches[0].score);
  console.log('Best match voter:', scoredMatches[0].voter);
  
  // Return the highest scored match
  return scoredMatches[0].voter;
}

function isVoterInDistrict(voter: VoterRecord, district: string): boolean {
  const districtType = district.split('-')[0]?.toLowerCase();
  const districtNumber = district.split('-')[1];
  
  if (!districtType || !districtNumber || !voter) {
    return false;
  }
  
  console.log(`Checking if voter is in ${districtType}-${districtNumber}`);
  console.log(`Voter's districts: AD=${voter.assembly_district}, SD=${voter.state_senate_district}, CD=${voter.congressional_district}`);
  
  if (districtType === 'ad' && voter.assembly_district === districtNumber) {
    return true;
  }
  if (districtType === 'sd' && voter.state_senate_district === districtNumber) {
    return true;
  }
  if (districtType === 'cd' && voter.congressional_district === districtNumber) {
    return true;
  }
  
  return false;
}

export async function validateSignatures(
  extractedSignatures: ExtractedSignature[],
  petitionDistrict: string = "AD-73"
): Promise<ValidationResult> {
  const validations = await Promise.all(
    extractedSignatures.map(async (sig) => {
      try {
        const voter = await findMatchingVoter(sig.name, sig.address);
        
        if (!voter) {
          console.log(`No matching voter found for: ${sig.name}, ${sig.address}`);
          return {
            id: Math.random().toString(36).substr(2, 9),
            name: sig.name,
            address: sig.address,
            status: "invalid" as const,
            reason: "No matching voter found",
            confidence: sig.confidence,
            image_region: sig.image_region,
            page_number: sig.page_number
          };
        }
        
        const inDistrict = isVoterInDistrict(voter, petitionDistrict);
        
        if (!inDistrict) {
          console.log(`Voter not in required district: ${sig.name}, ${voter.assembly_district} vs required ${petitionDistrict}`);
          return {
            id: Math.random().toString(36).substr(2, 9),
            name: sig.name,
            address: sig.address,
            status: "invalid" as const,
            reason: "Voter not in required district",
            confidence: sig.confidence,
            matched_voter: {
              state_voter_id: voter.state_voter_id,
              first_name: voter.first_name || "",
              last_name: voter.last_name || "",
              address: `${voter.house || ""} ${voter.street_name || ""}`,
              district: voter.assembly_district || "",
              residence_city: voter.residence_city || "",
              zip_code: voter.zip_code || "",
              assembly_district: voter.assembly_district || "",
              state_senate_district: voter.state_senate_district || "",
              congressional_district: voter.congressional_district || "",
              enrolled_party: voter.enrolled_party || ""
            },
            image_region: sig.image_region,
            page_number: sig.page_number
          };
        }
        
        if (sig.confidence < 0.8) {
          console.log(`Low confidence signature: ${sig.name}, confidence: ${sig.confidence}`);
          return {
            id: Math.random().toString(36).substr(2, 9),
            name: sig.name,
            address: sig.address,
            status: "uncertain" as const,
            reason: "Low confidence in signature extraction",
            confidence: sig.confidence,
            matched_voter: {
              state_voter_id: voter.state_voter_id,
              first_name: voter.first_name || "",
              last_name: voter.last_name || "",
              address: `${voter.house || ""} ${voter.street_name || ""}`,
              district: voter.assembly_district || "",
              residence_city: voter.residence_city || "",
              zip_code: voter.zip_code || "",
              assembly_district: voter.assembly_district || "",
              state_senate_district: voter.state_senate_district || "",
              congressional_district: voter.congressional_district || "",
              enrolled_party: voter.enrolled_party || ""
            },
            image_region: sig.image_region,
            page_number: sig.page_number
          };
        }
        
        console.log(`Valid signature found: ${sig.name}, ${voter.first_name} ${voter.last_name}`);
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: sig.name,
          address: sig.address,
          status: "valid" as const,
          confidence: sig.confidence,
          matched_voter: {
            state_voter_id: voter.state_voter_id,
            first_name: voter.first_name || "",
            last_name: voter.last_name || "",
            address: `${voter.house || ""} ${voter.street_name || ""}`,
            district: voter.assembly_district || "",
            residence_city: voter.residence_city || "",
            zip_code: voter.zip_code || "",
            assembly_district: voter.assembly_district || "",
            state_senate_district: voter.state_senate_district || "",
            congressional_district: voter.congressional_district || "",
            enrolled_party: voter.enrolled_party || ""
          },
          image_region: sig.image_region,
          page_number: sig.page_number
        };
      } catch (error) {
        console.error("Error validating signature:", error);
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: sig.name,
          address: sig.address,
          status: "uncertain" as const,
          reason: "Error during validation",
          confidence: sig.confidence,
          image_region: sig.image_region,
          page_number: sig.page_number
        };
      }
    })
  );
  
  const validCount = validations.filter(v => v.status === "valid").length;
  const invalidCount = validations.filter(v => v.status === "invalid").length;
  const uncertainCount = validations.filter(v => v.status === "uncertain").length;
  
  return {
    signatures: validations,
    stats: {
      total: validations.length,
      valid: validCount,
      invalid: invalidCount,
      uncertain: uncertainCount
    },
    petition_info: {
      district: petitionDistrict,
      required_signatures: 500
    }
  };
}

export async function processUploadedFiles(
  files: File[],
  district: string = "AD-73"
): Promise<ValidationResult> {
  try {
    if (!files || files.length === 0) {
      toast.warning("No files selected", {
        description: "Please upload at least one petition page to validate"
      });
      
      return {
        signatures: [],
        stats: { total: 0, valid: 0, invalid: 0, uncertain: 0 }
      };
    }
    
    console.log(`Processing ${files.length} files for district ${district}`);
    toast.info("Processing petition files...", {
      description: "Extracting signatures from the uploaded documents"
    });
    
    const extractedSignatures = await extractSignaturesFromFiles(files);
    console.log(`Extracted ${extractedSignatures.length} signatures total`);
    
    if (extractedSignatures.length === 0) {
      toast.warning("No signatures detected", {
        description: "The AI couldn't detect any signatures in the uploaded documents"
      });
      
      return {
        signatures: [],
        stats: { total: 0, valid: 0, invalid: 0, uncertain: 0 }
      };
    }
    
    toast.info("Validating signatures...", {
      description: "Matching signatures against voter records"
    });
    
    const validationResults = await validateSignatures(extractedSignatures, district);
    
    toast.success("Validation complete", {
      description: `Processed ${validationResults.stats.total} signatures`
    });
    
    return validationResults;
  } catch (error) {
    console.error("Error processing files:", error);
    toast.error("Error processing files", {
      description: "There was a problem processing your petition files"
    });
    
    return {
      signatures: [],
      stats: { total: 0, valid: 0, invalid: 0, uncertain: 0 }
    };
  }
}
