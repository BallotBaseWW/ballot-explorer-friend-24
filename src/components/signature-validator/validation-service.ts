// Replace this file with your validation service implementation
// This is a placeholder for your custom validation logic

import { supabase } from "@/integrations/supabase/client";
import { ValidationResult, ValidationResultStats, ExtractedSignature, SignatureValidation } from "./types";

/**
 * Process uploaded files for signature validation
 */
export const processUploadedFiles = async (files: File[], district: string): Promise<ValidationResult> => {
  if (!files.length) {
    throw new Error("No files provided");
  }
  
  try {
    // Extract petition type and party from district information if available
    let petitionType = "";
    let party = "";
    
    // This would need to be passed from the form in a real implementation
    if (district.includes('-')) {
      // This is just placeholder logic - in real implementation this would come from the form
      petitionType = "designating";
      party = "DEM";
    }
    
    // Extract signatures from each file
    let allSignatures: SignatureValidation[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const pageNumber = i + 1;
      
      console.log(`Processing file ${pageNumber} of ${files.length}: ${file.name}`);
      
      const extractedSignatures = await extractSignaturesFromFile(file, pageNumber, district, petitionType, party);
      console.log(`Extracted ${extractedSignatures.length} signatures from file ${pageNumber}`);
      
      // Validate each signature against voter database
      const validatedSignatures = await validateSignatures(extractedSignatures, district);
      
      allSignatures = [...allSignatures, ...validatedSignatures];
    }
    
    // Calculate stats
    const stats = calculateStats(allSignatures);
    
    return {
      signatures: allSignatures,
      stats: stats
    };
    
  } catch (error) {
    console.error("Error processing files:", error);
    throw new Error(`Failed to process files: ${error.message}`);
  }
};

/**
 * Extract signatures from a file using API
 */
const extractSignaturesFromFile = async (
  file: File, 
  pageNumber: number, 
  district: string, 
  petitionType: string = "", 
  party: string = ""
): Promise<SignatureValidation[]> => {
  try {
    // Create FormData object for the API request
    const formData = new FormData();
    formData.append('file', file);
    formData.append('page_number', pageNumber.toString());
    
    // Add additional petition context
    if (district) {
      formData.append('district', district);
    }
    if (petitionType) {
      formData.append('petition_type', petitionType);
    }
    if (party) {
      formData.append('party', party);
    }
    
    // Call the Edge Function to extract signatures
    const { data: functionData, error: functionError } = await supabase.functions.invoke('extract-signatures', {
      body: formData,
    });
    
    if (functionError) {
      console.error("Function error:", functionError);
      throw new Error(`Failed to extract signatures: ${functionError.message}`);
    }
    
    if (!functionData) {
      throw new Error("No data returned from extraction function");
    }
    
    // Check for error in response
    if (functionData.error) {
      console.error("API error:", functionData.error);
      throw new Error(`API error: ${functionData.error}`);
    }
    
    // Transform extracted signatures
    const signatures = functionData.signatures || [];
    console.log(`Received ${signatures.length} signatures from extraction API`);
    
    // Create validation objects
    return signatures.map((sig: ExtractedSignature, index: number) => ({
      id: `${pageNumber}-${index + 1}`,
      name: sig.name,
      address: sig.address,
      status: "uncertain", // Will be updated in validation
      confidence: sig.confidence,
      image_region: sig.image_region,
      page_number: pageNumber
    }));
    
  } catch (error) {
    console.error(`Error extracting signatures from file:`, error);
    throw error;
  }
};

/**
 * Validate signatures against voter records
 */
const validateSignatures = async (signatures: SignatureValidation[], district: string): Promise<SignatureValidation[]> => {
  // This is mock functionality - in real implementation, you would query your voter database
  // We're simulating this for the demo with random validation
  
  const validatedSignatures = await Promise.all(signatures.map(async (signature) => {
    try {
      // Parse district type and number
      let districtType = "";
      let districtNumber = "";
      
      if (district.includes('-')) {
        const parts = district.split('-');
        districtType = parts[0].toUpperCase(); // AD, SD, CD
        districtNumber = parts[1];
      }
      
      // Extract and normalize name parts
      const nameParts = signature.name.split(' ').filter(p => p.trim().length > 0);
      
      if (nameParts.length < 2) {
        return {
          ...signature,
          status: "invalid",
          reason: "Could not parse name correctly"
        };
      }
      
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      
      // Parse address for borough
      const address = signature.address.toLowerCase();
      let county = "";
      
      if (address.includes('staten island') || address.includes('richmond')) {
        county = 'statenisland';
      } else if (address.includes('brooklyn') || address.includes('kings')) {
        county = 'brooklyn';
      } else if (address.includes('bronx')) {
        county = 'bronx';
      } else if (address.includes('queens')) {
        county = 'queens';
      } else if (address.includes('manhattan') || address.includes('new york')) {
        county = 'manhattan';
      } else {
        // Can't determine county
        return {
          ...signature,
          status: "uncertain",
          reason: "Could not determine borough from address"
        };
      }
      
      // Look up the voter
      const { data: voters, error } = await supabase
        .from(county)
        .select()
        .ilike('first_name', `${firstName}%`)
        .ilike('last_name', `${lastName}%`)
        .limit(5);
      
      if (error) {
        console.error(`Database query error for ${signature.name}:`, error);
        return {
          ...signature,
          status: "uncertain",
          reason: "Database error during validation"
        };
      }
      
      if (!voters || voters.length === 0) {
        return {
          ...signature,
          status: "invalid",
          reason: "No matching voter found"
        };
      }
      
      // Find best match using address components
      let bestMatch = null;
      let highestScore = 0;
      
      for (const voter of voters) {
        let score = 0;
        
        // Score name match
        if (voter.first_name.toLowerCase() === firstName.toLowerCase()) score += 3;
        else if (voter.first_name.toLowerCase().startsWith(firstName.toLowerCase())) score += 2;
        
        if (voter.last_name.toLowerCase() === lastName.toLowerCase()) score += 3;
        else if (voter.last_name.toLowerCase().startsWith(lastName.toLowerCase())) score += 2;
        
        // Score address match (check house number and street)
        const voterAddress = `${voter.house || ''} ${voter.street_name || ''}`.toLowerCase();
        
        // Extract house number and street from signature address
        const addressRegex = /(\d+)\s+([a-zA-Z0-9\s]+?)\s*(?:,|$)/i;
        const addressMatch = address.match(addressRegex);
        
        if (addressMatch) {
          const [_, houseNumber, streetName] = addressMatch;
          
          if (voterAddress.includes(houseNumber)) score += 2;
          if (voterAddress.includes(streetName.trim().toLowerCase())) score += 2;
        }
        
        // Check district match
        if (districtType === 'AD' && voter.assembly_district === districtNumber) {
          score += 3;
        } else if (districtType === 'SD' && voter.state_senate_district === districtNumber) {
          score += 3;
        } else if (districtType === 'CD' && voter.congressional_district === districtNumber) {
          score += 3;
        } else if (district === 'CITYWIDE') {
          // For citywide, we don't need to check specific district
          score += 1;
        } else if (districtType) {
          // Wrong district
          score -= 2;
        }
        
        // Keep track of best match
        if (score > highestScore) {
          highestScore = score;
          bestMatch = voter;
        }
      }
      
      // Determine if the match is good enough
      if (bestMatch) {
        // Convert district data based on type
        let matchedDistrict = "";
        if (districtType === 'AD') {
          matchedDistrict = bestMatch.assembly_district;
        } else if (districtType === 'SD') {
          matchedDistrict = bestMatch.state_senate_district;
        } else if (districtType === 'CD') {
          matchedDistrict = bestMatch.congressional_district;
        }
        
        let status: "valid" | "invalid" | "uncertain" = "uncertain";
        let reason = "";
        
        if (highestScore >= 8) {
          status = "valid";
        } else if (highestScore >= 4) {
          status = "uncertain";
          reason = "Low confidence match";
        } else {
          status = "invalid";
          reason = "Poor match quality";
        }
        
        // Check district match for non-citywide petitions
        if (status !== "invalid" && districtType && district !== 'CITYWIDE' && matchedDistrict !== districtNumber) {
          status = "invalid";
          reason = `Voter is in ${districtType}-${matchedDistrict}, not ${districtType}-${districtNumber}`;
        }
        
        return {
          ...signature,
          status,
          reason,
          matched_voter: {
            state_voter_id: bestMatch.state_voter_id,
            first_name: bestMatch.first_name,
            last_name: bestMatch.last_name,
            address: `${bestMatch.house || ''} ${bestMatch.street_name || ''}`,
            district: matchedDistrict,
            residence_city: bestMatch.residence_city,
            zip_code: bestMatch.zip_code,
            assembly_district: bestMatch.assembly_district,
            congressional_district: bestMatch.congressional_district,
            state_senate_district: bestMatch.state_senate_district,
            enrolled_party: bestMatch.enrolled_party,
          }
        };
      }
      
      // No good match found
      return {
        ...signature,
        status: "invalid",
        reason: "No suitable voter match found"
      };
      
    } catch (error) {
      console.error(`Error validating signature for ${signature.name}:`, error);
      return {
        ...signature,
        status: "uncertain",
        reason: "Error during validation"
      };
    }
  }));
  
  return validatedSignatures;
};

/**
 * Calculate statistics from validation results
 */
const calculateStats = (signatures: SignatureValidation[]): ValidationResultStats => {
  const total = signatures.length;
  const valid = signatures.filter(sig => sig.status === "valid").length;
  const invalid = signatures.filter(sig => sig.status === "invalid").length;
  const uncertain = signatures.filter(sig => sig.status === "uncertain").length;
  
  return {
    total,
    valid,
    invalid,
    uncertain
  };
};
