
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
            description: error.message || "Unknown error occurred"
          });
          continue;
        }
        
        console.log('Edge function response:', data);
        
        // Check if there's an error message in the data
        if (data && data.error) {
          console.warn('Error from extract-signatures:', data.error);
          toast.error(`Error analyzing page ${pageNumber}`, {
            description: data.error
          });
          
          if (data.details) {
            toast.info(`Additional info`, {
              description: data.details
            });
          }
          continue;
        }
        
        if (data && data.signatures && Array.isArray(data.signatures)) {
          // Add signatures to the collection
          extractedSignatures.push(...data.signatures);
          console.log(`Added ${data.signatures.length} signatures from page ${pageNumber}`);
          
          if (data.signatures.length === 0) {
            toast.warning(`No signatures found on page ${pageNumber}`, {
              description: "The AI couldn't detect any valid signatures on this page"
            });
          }
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
        description: "The AI couldn't detect any signatures in the uploaded documents. Try uploading clearer images or documents with visible signatures."
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
    // Improved name parsing with better handling of multi-part names
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const nameParts = cleanName.split(' ');
    
    let firstName = '';
    let lastName = '';
    let middleName = '';
    
    if (nameParts.length === 1) {
      // Only one name provided
      firstName = nameParts[0];
    } else if (nameParts.length === 2) {
      // First and last name
      firstName = nameParts[0];
      lastName = nameParts[1];
    } else if (nameParts.length >= 3) {
      // First, middle, and last name
      firstName = nameParts[0];
      middleName = nameParts.slice(1, -1).join(' ');
      lastName = nameParts[nameParts.length - 1];
    }
    
    firstName = firstName.replace(/[^\w\s]/g, ''); // Remove special characters
    lastName = lastName.replace(/[^\w\s]/g, '');
    
    console.log(`Looking for voter with parsed name: First='${firstName}', Middle='${middleName}', Last='${lastName}'`);
    
    // Enhanced borough detection with address normalization
    const normalizedAddress = address.toLowerCase().replace(/\s+/g, ' ').trim();
    
    let tableToQuery: VoterTable = "statenisland"; // Default
    let confidenceScore = 0;
    
    // Improved borough detection with more patterns and zip code ranges
    const boroughMatches = {
      statenisland: [
        /\bstaten\s*island\b/i, 
        /\brichmond\s*county\b/i,
        /\bs\.?i\.?\b/i,
        /\bstaten\s*is\b/i
      ],
      brooklyn: [
        /\bbrooklyn\b/i, 
        /\bkings\s*county\b/i,
        /\bkings\b/i
      ],
      bronx: [
        /\bbronx\b/i,
        /\bthe\s*bronx\b/i
      ],
      queens: [
        /\bqueens\b/i,
        /\bqueen\'?s\s*county\b/i
      ],
      manhattan: [
        /\bmanhattan\b/i,
        /\bnew\s*york\s*(?:city|ny|,\s*ny)\b/i,
        /\bmanhattan\s*(?:county|borough)\b/i,
        /\bnew\s*york\s*county\b/i
      ]
    };
    
    // Check for borough name in address
    for (const [borough, patterns] of Object.entries(boroughMatches)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedAddress)) {
          tableToQuery = borough as VoterTable;
          confidenceScore += 2;
          console.log(`Borough detected from address text: ${tableToQuery}`);
          break;
        }
      }
    }
    
    // Check zip code if borough not confidently determined
    if (confidenceScore < 2) {
      const zipMatch = normalizedAddress.match(/\b(\d{5})(?:-\d{4})?\b/);
      if (zipMatch) {
        const zip = zipMatch[1];
        console.log(`Detected ZIP code: ${zip}`);
        
        // Enhanced zip code ranges
        if (/^103[0-1][0-9]$/.test(zip)) {
          tableToQuery = "statenisland";
          console.log('ZIP code indicates Staten Island');
          confidenceScore += 3;
        }
        else if (/^112[0-9][0-9]$/.test(zip)) {
          tableToQuery = "brooklyn";
          console.log('ZIP code indicates Brooklyn');
          confidenceScore += 3;
        }
        else if (/^100[0-9][0-9]$/.test(zip) || /^101[0-9][0-9]$/.test(zip)) {
          tableToQuery = "manhattan";
          console.log('ZIP code indicates Manhattan');
          confidenceScore += 3;
        }
        else if (/^104[0-9][0-9]$/.test(zip)) {
          tableToQuery = "bronx";
          console.log('ZIP code indicates Bronx');
          confidenceScore += 3;
        }
        else if (/^113[0-9][0-9]$/.test(zip) || /^114[0-9][0-9]$/.test(zip) || /^116[0-9][0-9]$/.test(zip)) {
          tableToQuery = "queens";
          console.log('ZIP code indicates Queens');
          confidenceScore += 3;
        }
      }
    }
    
    console.log(`Using voter database for: ${tableToQuery}`);
    
    // Extract street address information with improved parsing
    const streetInfo = extractStreetInfo(normalizedAddress);
    console.log('Extracted street info:', streetInfo);
    
    // Prepare more flexible database query
    let query = supabase
      .from(tableToQuery)
      .select()
      .limit(10); // Increased limit for better matching chance
    
    // Add more flexible name filtering with fuzzy matching
    if (firstName.length > 1) {
      // Use more flexible matching for first name
      query = query.or(`first_name.ilike.${firstName}%,first_name.ilike.%${firstName}%`);
    }
    
    if (lastName.length > 1) {
      // Use more flexible matching for last name
      query = query.or(`last_name.ilike.${lastName}%,last_name.ilike.%${lastName}%`);
    }
    
    // Add street name filtering if available
    if (streetInfo.streetName && streetInfo.streetName.length > 2) {
      // More flexible street name matching
      query = query.or(`street_name.ilike.%${streetInfo.streetName}%,street_name.ilike.${streetInfo.streetName}%`);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error finding matching voter:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No matches found with initial criteria, trying broader search');
      
      // Try an even broader search if no results found
      const { data: broadData, error: broadError } = await supabase
        .from(tableToQuery)
        .select()
        .or(`first_name.ilike.${firstName.slice(0, 3)}%,last_name.ilike.${lastName.slice(0, 3)}%`)
        .limit(15);
      
      if (broadError) {
        console.error('Error in broader voter search:', broadError);
        return null;
      }
      
      if (!broadData || broadData.length === 0) {
        console.log('No matches found even with broader criteria');
        
        // Try other boroughs as last resort if no matches found
        if (confidenceScore < 3) {
          console.log('Low confidence in borough detection, trying all boroughs');
          
          for (const alternateBorough of ['statenisland', 'brooklyn', 'manhattan', 'bronx', 'queens']) {
            if (alternateBorough === tableToQuery) continue;
            
            const { data: altData } = await supabase
              .from(alternateBorough as VoterTable)
              .select()
              .or(`first_name.ilike.${firstName.slice(0, 3)}%,last_name.ilike.${lastName.slice(0, 3)}%`)
              .limit(5);
              
            if (altData && altData.length > 0) {
              console.log(`Found ${altData.length} potential matches in ${alternateBorough}`);
              return getBestMatch(altData, firstName, lastName, streetInfo, middleName);
            }
          }
        }
        
        return null;
      }
      
      console.log(`Found ${broadData.length} potential matches with broader criteria`);
      return getBestMatch(broadData, firstName, lastName, streetInfo, middleName);
    }
    
    console.log(`Found ${data.length} potential matches`);
    return getBestMatch(data, firstName, lastName, streetInfo, middleName);
  } catch (error) {
    console.error('Error in findMatchingVoter:', error);
    return null;
  }
}

// Enhanced function to extract street information from an address
function extractStreetInfo(address: string): { houseNumber?: string; streetName?: string; apartment?: string } {
  try {
    // Remove common prefix words that might confuse the parser
    const normalizedAddress = address.toLowerCase()
      .replace(/^c\/o\s+|care\s+of\s+|attn:?\s+/i, '')
      .replace(/\b(apt\.?|unit|#|suite|suite #?|apartment)\s*([a-z0-9-]+)/i, ' APT $2') // Standardize apartment formats
      .trim();
    
    // Extract apartment/unit information separately
    let apartment: string | undefined;
    const aptMatch = normalizedAddress.match(/\b(apt\.?|unit|#|suite|suite #?|apartment)\s*([a-z0-9-]+)/i);
    if (aptMatch) {
      apartment = aptMatch[2];
    }
    
    // Clean address to focus on house number and street
    const cleanedAddress = normalizedAddress
      .replace(/\b(apt\.?|unit|#|suite|suite #?|apartment)\s*[a-z0-9-]+/i, '')
      .replace(/,\s*([a-z\s]+)\s*,\s*([a-z]{2})\s*\d{5}(-\d{4})?$/i, '') // Remove city, state, zip format
      .replace(/\b(bronx|brooklyn|queens|staten island|manhattan|new york|ny)\b/i, '') // Remove borough names
      .replace(/,/g, ' ') // Replace commas with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    // Match house number and street name
    const basicMatch = cleanedAddress.match(/^(\d+(?:-\d+)?)\s+(.+?)(?:\s+(?:apt|unit|#)|\s*$)/i);
    
    if (basicMatch) {
      const streetName = basicMatch[2]
        .replace(/\b(street|st\.?|avenue|ave\.?|road|rd\.?|boulevard|blvd\.?|place|pl\.?|lane|ln\.?|drive|dr\.?|court|ct\.?|parkway|pkwy\.?|way|terrace|ter\.?|circle|cir\.?)\b$/i, '')
        .trim();
      
      return {
        houseNumber: basicMatch[1],
        streetName: streetName,
        apartment
      };
    }
    
    // Try a more flexible match if the first one failed
    const flexMatch = cleanedAddress.match(/(\d+(?:-\d+)?)\s+([^,]+)/i);
    if (flexMatch) {
      return {
        houseNumber: flexMatch[1],
        streetName: flexMatch[2].trim(),
        apartment
      };
    }
    
    return {};
  } catch (e) {
    console.error('Error extracting street info:', e);
    return {};
  }
}

// Enhanced matching function with improved scoring algorithm
function getBestMatch(
  potentialMatches: VoterRecord[], 
  firstName: string, 
  lastName: string, 
  streetInfo: { houseNumber?: string; streetName?: string; apartment?: string },
  middleName?: string
): VoterRecord | null {
  if (potentialMatches.length === 0) return null;
  
  // If we only have one match, return it
  if (potentialMatches.length === 1) return potentialMatches[0];
  
  // Enhanced scoring with weighted metrics
  const scoredMatches = potentialMatches.map(voter => {
    let score = 0;
    let matchDetails: string[] = []; // For logging match criteria
    
    // Convert names to lowercase for consistent comparison
    const voterFirstName = (voter.first_name || '').toLowerCase();
    const voterLastName = (voter.last_name || '').toLowerCase();
    const voterMiddleName = (voter.middle || '').toLowerCase();
    
    const firstNameLower = firstName.toLowerCase();
    const lastNameLower = lastName.toLowerCase();
    const middleNameLower = middleName ? middleName.toLowerCase() : '';
    
    // Name matching with improved scoring
    if (voterFirstName === firstNameLower) {
      score += 4;
      matchDetails.push('Exact first name match');
    } else if (voterFirstName.startsWith(firstNameLower) || firstNameLower.startsWith(voterFirstName)) {
      score += 3; 
      matchDetails.push('Partial first name match');
    } else if (levenshteinDistance(voterFirstName, firstNameLower) <= 2) {
      score += 2;
      matchDetails.push('Similar first name (Levenshtein)');
    }
    
    if (voterLastName === lastNameLower) {
      score += 4;
      matchDetails.push('Exact last name match');
    } else if (voterLastName.startsWith(lastNameLower) || lastNameLower.startsWith(voterLastName)) {
      score += 3;
      matchDetails.push('Partial last name match');
    } else if (levenshteinDistance(voterLastName, lastNameLower) <= 2) {
      score += 2;
      matchDetails.push('Similar last name (Levenshtein)');
    }
    
    // Middle name matching
    if (middleNameLower && voterMiddleName) {
      if (voterMiddleName === middleNameLower) {
        score += 2;
        matchDetails.push('Middle name match');
      } else if (voterMiddleName.startsWith(middleNameLower) || middleNameLower.startsWith(voterMiddleName)) {
        score += 1;
        matchDetails.push('Partial middle name match');
      }
    }
    
    // Address matching with improved scoring
    if (streetInfo.houseNumber && voter.house) {
      if (voter.house === streetInfo.houseNumber) {
        score += 4;
        matchDetails.push('Exact house number match');
      } else if (levenshteinDistance(voter.house, streetInfo.houseNumber) <= 1) {
        score += 2;
        matchDetails.push('Similar house number');
      }
    }
    
    if (streetInfo.streetName && voter.street_name) {
      const voterStreet = voter.street_name.toLowerCase().trim();
      const signatureStreet = streetInfo.streetName.toLowerCase().trim();
      
      if (voterStreet === signatureStreet) {
        score += 4;
        matchDetails.push('Exact street name match');
      } else if (voterStreet.includes(signatureStreet) || signatureStreet.includes(voterStreet)) {
        score += 3;
        matchDetails.push('Partial street name match');
      } else if (levenshteinDistance(voterStreet, signatureStreet) <= 3) {
        score += 2;
        matchDetails.push('Similar street name (Levenshtein)');
      }
    }
    
    // Add bonus points for active voters - they're more likely to be signers
    if (voter.voter_status === 'A') {
      score += 1;
      matchDetails.push('Active voter status');
    }
    
    // Log detailed match information for debugging
    console.log(`Voter ${voter.first_name} ${voter.last_name} match score: ${score}`);
    console.log(`Match details: ${matchDetails.join(', ')}`);
    
    return { voter, score, matchDetails };
  });
  
  // Sort by score (highest first)
  scoredMatches.sort((a, b) => b.score - a.score);
  
  // Log the top match for debugging
  if (scoredMatches.length > 0) {
    console.log('Best match score:', scoredMatches[0].score);
    console.log('Best match voter:', scoredMatches[0].voter);
    console.log('Match details:', scoredMatches[0].matchDetails.join(', '));
  }
  
  // Threshold for accepting a match
  if (scoredMatches[0].score < 5) {
    console.log('Best match score too low, not considering a valid match');
    return null;
  }
  
  // Return the highest scored match
  return scoredMatches[0].voter;
}

// Helper function to calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost  // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

// Enhanced district validation with more flexible district code handling
function isVoterInDistrict(voter: VoterRecord, district: string): boolean {
  // Parse the district format
  const districtParts = district.split('-');
  if (districtParts.length !== 2) {
    console.log(`Invalid district format: ${district}`);
    return false;
  }
  
  const districtType = districtParts[0]?.toLowerCase();
  const districtNumber = districtParts[1];
  
  if (!districtType || !districtNumber || !voter) {
    console.log(`Missing district information or voter data`);
    return false;
  }
  
  console.log(`Checking if voter is in ${districtType}-${districtNumber}`);
  console.log(`Voter's districts: AD=${voter.assembly_district}, SD=${voter.state_senate_district}, CD=${voter.congressional_district}`);
  
  // Standardize district number format (remove leading zeros)
  const standardizedRequestedDistrict = districtNumber.replace(/^0+/, '');
  
  // Improved district comparison with standardized formatting
  let voterDistrict: string | undefined;
  if (districtType === 'ad') {
    voterDistrict = voter.assembly_district?.replace(/^0+/, '');
  } else if (districtType === 'sd') {
    voterDistrict = voter.state_senate_district?.replace(/^0+/, '');
  } else if (districtType === 'cd') {
    voterDistrict = voter.congressional_district?.replace(/^0+/, '');
  }
  
  // Compare standardized district numbers
  if (voterDistrict === standardizedRequestedDistrict) {
    console.log(`District match found: ${voterDistrict} = ${standardizedRequestedDistrict}`);
    return true;
  }
  
  // Allow for numeric comparison as well (handles cases where strings and numbers are mixed)
  if (voterDistrict && parseInt(voterDistrict) === parseInt(standardizedRequestedDistrict)) {
    console.log(`District match found (numeric): ${voterDistrict} = ${standardizedRequestedDistrict}`);
    return true;
  }
  
  console.log(`District mismatch: Voter district ${voterDistrict} ≠ ${standardizedRequestedDistrict}`);
  return false;
}

export async function validateSignatures(
  extractedSignatures: ExtractedSignature[],
  petitionDistrict: string = "AD-73"
): Promise<ValidationResult> {
  console.log(`Validating ${extractedSignatures.length} signatures for district ${petitionDistrict}`);
  
  const validations = await Promise.all(
    extractedSignatures.map(async (sig) => {
      try {
        console.log(`Processing signature: ${sig.name}, ${sig.address}`);
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
        
        // Adjust confidence threshold for better classification
        if (sig.confidence < 0.75) {
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
  
  console.log(`Validation complete: ${validCount} valid, ${invalidCount} invalid, ${uncertainCount} uncertain`);
  
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
