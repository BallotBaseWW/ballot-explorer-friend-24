
import { ExtractedSignature, ValidationResult } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

// This is a placeholder function that will eventually call our AI service
export async function extractSignaturesFromFiles(files: File[]): Promise<ExtractedSignature[]> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock data for now
  return [
    {
      name: "John Smith",
      address: "123 Main St, New York, NY 10001",
      image_region: { x: 100, y: 200, width: 300, height: 100 },
      page_number: 1,
      confidence: 0.85
    },
    {
      name: "Jane Doe",
      address: "456 Oak Ave, Brooklyn, NY 11201",
      image_region: { x: 100, y: 400, width: 300, height: 100 },
      page_number: 1,
      confidence: 0.92
    },
    {
      name: "Bob Johnson",
      address: "789 Pine Rd, New York, NY 10002",
      image_region: { x: 100, y: 600, width: 300, height: 100 },
      page_number: 1,
      confidence: 0.78
    }
  ];
}

// Mock function to find matching voters in our database
async function findMatchingVoter(name: string, address: string): Promise<VoterRecord | null> {
  try {
    // Split name into parts
    const nameParts = name.split(' ');
    let firstName = nameParts[0];
    let lastName = nameParts[nameParts.length - 1];
    
    // Extract address components (simplified approach)
    // In a real implementation, we'd use proper address parsing
    const addressParts = address.split(',');
    const streetAddress = addressParts[0]?.trim() || '';
    
    // Perform Supabase query
    // Start with Bronx county as an example
    const { data, error } = await supabase
      .from('bronx')
      .select()
      .ilike('first_name', `${firstName}%`)
      .ilike('last_name', `${lastName}%`)
      .ilike('street_name', `%${streetAddress.split(' ').slice(1).join(' ')}%`)
      .limit(1);
    
    if (error) {
      console.error('Error finding matching voter:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error in findMatchingVoter:', error);
    return null;
  }
}

// Function to check if a voter's district matches the petition district
function isVoterInDistrict(voter: VoterRecord, district: string): boolean {
  // This is simplified logic - would need to be expanded based on actual district requirements
  // Example: checking if the voter's assembly district matches the petition's required district
  const districtType = district.split('-')[0]?.toLowerCase();
  const districtNumber = district.split('-')[1];
  
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

// Function to validate signatures against voter records
export async function validateSignatures(
  extractedSignatures: ExtractedSignature[],
  petitionDistrict: string = "AD-73" // Default test district
): Promise<ValidationResult> {
  const validations = await Promise.all(
    extractedSignatures.map(async (sig) => {
      try {
        // Find matching voter
        const voter = await findMatchingVoter(sig.name, sig.address);
        
        if (!voter) {
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
        
        // Check if voter is in the correct district
        const inDistrict = isVoterInDistrict(voter, petitionDistrict);
        
        if (!inDistrict) {
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
        
        // If confidence is low, mark as uncertain
        if (sig.confidence < 0.8) {
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
        
        // Valid signature
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
  
  // Calculate stats
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
      required_signatures: 500 // Example threshold
    }
  };
}

// Main function to process uploaded files
export async function processUploadedFiles(
  files: File[],
  district: string = "AD-73" // Default test district
): Promise<ValidationResult> {
  try {
    toast.info("Processing petition files...", {
      description: "Extracting signatures from the uploaded documents"
    });
    
    // Extract signatures from files (will be handled by AI in the future)
    const extractedSignatures = await extractSignaturesFromFiles(files);
    
    toast.info("Validating signatures...", {
      description: "Matching signatures against voter records"
    });
    
    // Validate the extracted signatures against our voter database
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
    
    // Return empty results in case of error
    return {
      signatures: [],
      stats: { total: 0, valid: 0, invalid: 0, uncertain: 0 }
    };
  }
}
