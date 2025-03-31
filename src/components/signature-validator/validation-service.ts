
import { supabase } from "@/integrations/supabase/client";
import { ValidationResult, ValidationResultStats, ExtractedSignature, SignatureValidation, MatchedVoter } from "./types";

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
      
      try {
        const extractedSignatures = await extractSignaturesFromFile(file, pageNumber, district, petitionType, party);
        console.log(`Extracted ${extractedSignatures.length} signatures from file ${pageNumber}`);
        
        // Validate each signature against voter database
        const validatedSignatures = await validateSignatures(extractedSignatures, district);
        
        allSignatures = [...allSignatures, ...validatedSignatures];
      } catch (error: any) {
        console.error(`Error processing file ${file.name}:`, error);
        // For PDF files, we might get an error about MIME type from OpenAI
        if (file.type === 'application/pdf' && error.message?.includes("MIME type")) {
          const mockSignatures: SignatureValidation[] = [{
            id: `${pageNumber}-1`,
            name: "Please upload an image file instead",
            address: "PDF files are not supported yet. Please convert to JPG or PNG.",
            status: "uncertain",
            confidence: 0,
            page_number: pageNumber
          }];
          allSignatures = [...allSignatures, ...mockSignatures];
        } else {
          throw error; // Re-throw if it's not the PDF MIME type error
        }
      }
    }
    
    // Calculate stats
    const stats = calculateStats(allSignatures);
    
    return {
      signatures: allSignatures,
      stats: stats
    };
    
  } catch (error: any) {
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
      status: "uncertain" as "valid" | "invalid" | "uncertain", // Cast to proper union type
      confidence: sig.confidence,
      image_region: sig.image_region,
      page_number: pageNumber
    }));
    
  } catch (error: any) {
    console.error(`Error extracting signatures from file:`, error);
    throw error;
  }
};

/**
 * Validate signatures against voter records with improved fuzzy matching
 */
const validateSignatures = async (signatures: SignatureValidation[], district: string): Promise<SignatureValidation[]> => {
  // This implementation uses a more lenient matching approach
  
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
      
      // Better name parsing with error handling
      const nameParts = signature.name.split(' ').filter(p => p.trim().length > 0);
      
      if (nameParts.length < 1) {
        return {
          ...signature,
          status: "uncertain" as "valid" | "invalid" | "uncertain", 
          reason: "Could not parse name correctly",
          potential_matches: []
        };
      }
      
      // Extract first and last name with better handling of middle initials
      let firstName = nameParts[0];
      let lastName = nameParts[nameParts.length - 1];
      
      // If there's only one name part, treat it as a last name for searching
      if (nameParts.length === 1) {
        lastName = nameParts[0];
        firstName = "";
      }
      
      // Parse address for borough with improved detection
      const address = signature.address.toLowerCase();
      let county = detectCountyFromAddress(address);
      
      if (!county) {
        return {
          ...signature,
          status: "uncertain" as "valid" | "invalid" | "uncertain",
          reason: "Could not determine borough from address",
          potential_matches: []
        };
      }
      
      // Using a more flexible search strategy
      const countyTable = county as "statenisland" | "brooklyn" | "bronx" | "queens" | "manhattan";

      // Create multiple queries with different criteria for better matching
      let query = supabase.from(countyTable).select('*');
      
      // Very lenient name matching - searching for either first or last name
      if (lastName && firstName) {
        // Try to match both names (but not strictly)
        query = query.or(`last_name.ilike.%${lastName}%,first_name.ilike.%${firstName}%`);
      } else if (lastName) {
        // Match only last name if that's all we have
        query = query.ilike('last_name', `%${lastName}%`);
      }
      
      // Extract address components for flexible matching
      const addressComponents = extractAddressComponents(address);
      
      // If we have a house number, use it to narrow results
      if (addressComponents.houseNumber) {
        // We use a loose house number search
        query = query.eq('house', addressComponents.houseNumber);
      }
      
      // If we have a street name, use it as another filter
      if (addressComponents.streetName && addressComponents.streetName.length > 3) {
        // Use partial street name match
        query = query.ilike('street_name', `%${addressComponents.streetName}%`);
      }
      
      // Limit to a reasonable number of results for potential matches
      const { data: voters, error } = await query.limit(10);
      
      if (error) {
        console.error(`Database query error for ${signature.name}:`, error);
        return {
          ...signature,
          status: "uncertain" as "valid" | "invalid" | "uncertain",
          reason: "Database error during validation",
          potential_matches: []
        };
      }
      
      if (!voters || voters.length === 0) {
        // Try a second query with only last name if the first one failed
        const fallbackQuery = supabase.from(countyTable)
          .select('*')
          .ilike('last_name', `%${lastName}%`)
          .limit(10);
          
        const { data: fallbackVoters, error: fallbackError } = await fallbackQuery;
        
        if (fallbackError || !fallbackVoters || fallbackVoters.length === 0) {
          return {
            ...signature,
            status: "uncertain" as "valid" | "invalid" | "uncertain",
            reason: "No matching voter found",
            potential_matches: []
          };
        }
        
        // Convert the fallback voters to potential matches
        const potentialMatches = fallbackVoters.map(voter => createMatchedVoter(voter));
        
        return {
          ...signature,
          status: "uncertain" as "valid" | "invalid" | "uncertain",
          reason: "Multiple possible voters found - please select the correct one",
          potential_matches: potentialMatches
        };
      }
      
      // Score and rank the potential matches
      const scoredMatches = voters.map(voter => {
        const score = calculateMatchScore(signature, voter, district, districtType, districtNumber);
        return { voter, score };
      }).sort((a, b) => b.score - a.score);
      
      // Get the best match and potential alternatives
      const bestMatch = scoredMatches[0]?.voter;
      const matchScore = scoredMatches[0]?.score || 0;
      
      // Create a list of potential matches for the UI to display
      const potentialMatches = scoredMatches.map(match => createMatchedVoter(match.voter));
      
      // Determine the signature status based on the best match score
      let status: "valid" | "invalid" | "uncertain" = "uncertain";
      let reason = "";
      
      if (matchScore >= 10) {
        status = "valid";
        reason = "Strong voter match found";
      } else if (matchScore >= 5) {
        status = "uncertain";
        reason = "Potential voter match - please verify";
      } else if (potentialMatches.length > 0) {
        status = "uncertain";
        reason = "Multiple possible voters found - please select the correct one";
      } else {
        status = "invalid";
        reason = "No suitable voter match found";
      }
      
      // Check district match for non-citywide petitions if we have a best match
      if (status !== "invalid" && bestMatch && districtType && district !== 'CITYWIDE') {
        const matchedDistrict = getDistrictFromVoter(bestMatch, districtType);
        
        if (matchedDistrict && matchedDistrict !== districtNumber) {
          status = "invalid";
          reason = `Voter is in ${districtType}-${matchedDistrict}, not ${districtType}-${districtNumber}`;
        }
      }
      
      if (bestMatch) {
        return {
          ...signature,
          status,
          reason,
          matched_voter: createMatchedVoter(bestMatch),
          potential_matches: potentialMatches
        };
      } else {
        return {
          ...signature,
          status,
          reason,
          potential_matches: potentialMatches
        };
      }
      
    } catch (error: any) {
      console.error(`Error validating signature for ${signature.name}:`, error);
      return {
        ...signature,
        status: "uncertain" as "valid" | "invalid" | "uncertain",
        reason: "Error during validation: " + error.message,
        potential_matches: []
      };
    }
  }));
  
  return validatedSignatures;
};

/**
 * Helper function to create a MatchedVoter object from database record
 */
const createMatchedVoter = (voterRecord: any): MatchedVoter => {
  return {
    state_voter_id: voterRecord.state_voter_id,
    first_name: voterRecord.first_name || '',
    last_name: voterRecord.last_name || '',
    address: `${voterRecord.house || ''} ${voterRecord.street_name || ''}`,
    residence_city: voterRecord.residence_city,
    zip_code: voterRecord.zip_code,
    assembly_district: voterRecord.assembly_district,
    congressional_district: voterRecord.congressional_district,
    state_senate_district: voterRecord.state_senate_district,
    enrolled_party: voterRecord.enrolled_party,
  };
};

/**
 * Helper function to detect county from address with improved detection
 */
const detectCountyFromAddress = (address: string): string | null => {
  const lowercaseAddress = address.toLowerCase();
  
  // Improved county detection with more variations
  if (lowercaseAddress.includes('staten island') || 
      lowercaseAddress.includes('staten is') || 
      lowercaseAddress.includes('richmond') || 
      lowercaseAddress.includes('si ny') || 
      lowercaseAddress.includes('si, ny')) {
    return 'statenisland';
  } else if (lowercaseAddress.includes('brooklyn') || 
            lowercaseAddress.includes('bklyn') || 
            lowercaseAddress.includes('kings') || 
            lowercaseAddress.includes('bk ny') || 
            lowercaseAddress.includes('bk, ny')) {
    return 'brooklyn';
  } else if (lowercaseAddress.includes('bronx') || 
            lowercaseAddress.includes('bx ny') || 
            lowercaseAddress.includes('bx, ny')) {
    return 'bronx';
  } else if (lowercaseAddress.includes('queens') || 
            lowercaseAddress.includes('qns') || 
            lowercaseAddress.includes('qn ny') || 
            lowercaseAddress.includes('qn, ny')) {
    return 'queens';
  } else if (lowercaseAddress.includes('manhattan') || 
            lowercaseAddress.includes('new york, ny') || 
            lowercaseAddress.includes('new york ny') ||
            lowercaseAddress.includes('ny ny') ||
            lowercaseAddress.includes('ny, ny')) {
    return 'manhattan';
  }
  
  // ZIP code based detection as fallback
  if (lowercaseAddress.includes('10001') || lowercaseAddress.includes('10002')) {
    return 'manhattan'; // Manhattan ZIP codes
  } else if (lowercaseAddress.includes('10301') || lowercaseAddress.includes('10314')) {
    return 'statenisland'; // Staten Island ZIP codes
  } else if (lowercaseAddress.includes('11201') || lowercaseAddress.includes('11215')) {
    return 'brooklyn'; // Brooklyn ZIP codes
  } else if (lowercaseAddress.includes('10451') || lowercaseAddress.includes('10456')) {
    return 'bronx'; // Bronx ZIP codes
  } else if (lowercaseAddress.includes('11354') || lowercaseAddress.includes('11101')) {
    return 'queens'; // Queens ZIP codes
  }
  
  // Default to null if we can't determine the county
  return null;
};

/**
 * Helper function to extract address components
 */
const extractAddressComponents = (address: string) => {
  const components = {
    houseNumber: '',
    streetName: '',
    zip: ''
  };
  
  // Extract house number
  const houseMatch = address.match(/^(\d+)\s/);
  if (houseMatch) {
    components.houseNumber = houseMatch[1];
  }
  
  // Extract street name - look for common patterns
  const streetMatch = address.match(/\d+\s+([a-zA-Z0-9\s]+?)\s*(?:,|avenue|ave|street|st|road|rd|boulevard|blvd|drive|dr|lane|ln|place|pl|court|ct)/i);
  if (streetMatch) {
    components.streetName = streetMatch[1].trim();
  }
  
  // Extract ZIP code
  const zipMatch = address.match(/\b(\d{5})\b/);
  if (zipMatch) {
    components.zip = zipMatch[1];
  }
  
  return components;
};

/**
 * Calculate a match score between a signature and voter record
 */
const calculateMatchScore = (
  signature: SignatureValidation, 
  voter: any, 
  district: string,
  districtType: string,
  districtNumber: string
): number => {
  let score = 0;
  
  // Name matching (more lenient)
  const sigName = signature.name.toLowerCase();
  const voterName = `${voter.first_name || ''} ${voter.middle || ''} ${voter.last_name || ''}`.toLowerCase();
  
  // Check if signature name is contained in voter name or vice versa
  if (voterName.includes(sigName) || sigName.includes(voterName)) {
    score += 5;
  } else {
    // Check individual name parts
    const sigParts = sigName.split(' ').filter(p => p.length > 0);
    const voterParts = voterName.split(' ').filter(p => p.length > 0);
    
    // Count matching name parts
    for (const sigPart of sigParts) {
      if (sigPart.length < 2) continue; // Skip initials
      
      for (const voterPart of voterParts) {
        if (voterPart.length < 2) continue; // Skip initials
        
        // Check for partial match or same first 3 letters
        if (voterPart.includes(sigPart) || sigPart.includes(voterPart) || 
            (sigPart.substring(0, 3) === voterPart.substring(0, 3) && sigPart.substring(0, 3).length >= 3)) {
          score += 2;
          break;
        }
      }
    }
  }
  
  // First name specific matching
  if (voter.first_name && signature.name.toLowerCase().includes(voter.first_name.toLowerCase())) {
    score += 3;
  }
  
  // Last name specific matching
  if (voter.last_name && signature.name.toLowerCase().includes(voter.last_name.toLowerCase())) {
    score += 4;
  }
  
  // Address matching
  const sigAddress = signature.address.toLowerCase();
  const voterAddress = `${voter.house || ''} ${voter.street_name || ''}, ${voter.residence_city || ''}, ${voter.zip_code || ''}`.toLowerCase();
  
  // Address component extraction
  const addressComponents = extractAddressComponents(sigAddress);
  
  // House number match
  if (addressComponents.houseNumber && voter.house === addressComponents.houseNumber) {
    score += 4;
  }
  
  // Street name match (more lenient)
  if (addressComponents.streetName && 
      voter.street_name && 
      (voter.street_name.toLowerCase().includes(addressComponents.streetName.toLowerCase()) || 
       addressComponents.streetName.toLowerCase().includes(voter.street_name.toLowerCase()))) {
    score += 3;
  }
  
  // ZIP code match
  if (addressComponents.zip && voter.zip_code === addressComponents.zip) {
    score += 2;
  }
  
  // District match bonuses
  if (districtType && districtNumber) {
    const matchedDistrict = getDistrictFromVoter(voter, districtType);
    
    if (matchedDistrict === districtNumber) {
      score += 3; // Big bonus for correct district
    }
  }
  
  return score;
};

/**
 * Get the appropriate district value from a voter record based on district type
 */
const getDistrictFromVoter = (voter: any, districtType: string): string | null => {
  switch(districtType) {
    case 'AD':
      return voter.assembly_district;
    case 'SD':
      return voter.state_senate_district;
    case 'CD':
      return voter.congressional_district;
    default:
      return null;
  }
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
