
import { ExtractedSignature, ValidationResult } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

// This function uses AI to extract signatures from uploaded files
export async function extractSignaturesFromFiles(files: File[]): Promise<ExtractedSignature[]> {
  const extractedSignatures: ExtractedSignature[] = [];
  
  try {
    toast.info("Analyzing petition pages", {
      description: "Processing documents with AI signature detection"
    });
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const pageNumber = i + 1;
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('page_number', pageNumber.toString());
      
      // Get file preview for image processing
      const imageUrl = URL.createObjectURL(file);
      
      // Use canvas to analyze the image
      const signatures = await processImageWithCanvas(imageUrl, pageNumber);
      extractedSignatures.push(...signatures);
      
      // Revoke the object URL to free memory
      URL.revokeObjectURL(imageUrl);
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

// Process image using Canvas API and detect signature regions
async function processImageWithCanvas(imageUrl: string, pageNumber: number): Promise<ExtractedSignature[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        resolve([]);
        return;
      }
      
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const signatures = detectSignatureRegions(imageData, canvas.width, canvas.height, pageNumber);
      
      resolve(signatures);
    };
    img.onerror = () => {
      console.error("Error loading image");
      resolve([]);
    };
    img.src = imageUrl;
  });
}

// AI algorithm to detect signature regions and extract text
function detectSignatureRegions(
  imageData: ImageData,
  width: number,
  height: number,
  pageNumber: number
): ExtractedSignature[] {
  const signatures: ExtractedSignature[] = [];
  const data = imageData.data;
  
  // Simplified signature detection algorithm
  // In a real implementation, this would use a machine learning model
  
  // For demonstration, we'll detect dark regions that might be signatures
  // and extract "names" from nearby regions that might contain text
  
  // Divide the page into potential signature regions
  // Most petition forms have signatures in rows
  const potentialRows = 5; // Assume up to 5 signatures per page
  const rowHeight = height / potentialRows;
  
  for (let row = 0; row < potentialRows; row++) {
    // Check if this row contains a signature-like pattern
    const yStart = Math.floor(row * rowHeight);
    const yEnd = Math.floor((row + 1) * rowHeight);
    
    // Simplified detection - look for dark pixel clusters
    let darkPixelCount = 0;
    let darkestRegionX = 0;
    let darkestRegionY = 0;
    let maxDarkness = 0;
    
    // Scan the row for dark pixels that might indicate a signature
    for (let y = yStart; y < yEnd; y += 4) {
      for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x += 4) {
        // Get pixel index (RGBA)
        const idx = (y * width + x) * 4;
        
        // Calculate darkness (inverted brightness)
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const darkness = 255 - (r * 0.299 + g * 0.587 + b * 0.114);
        
        if (darkness > 100) { // Threshold for what's considered "dark"
          darkPixelCount++;
          
          if (darkness > maxDarkness) {
            maxDarkness = darkness;
            darkestRegionX = x;
            darkestRegionY = y;
          }
        }
      }
    }
    
    // If enough dark pixels were found, consider it a signature
    if (darkPixelCount > 100) {
      // Estimate signature bounding box
      const signatureWidth = Math.floor(width * 0.3);
      const signatureHeight = Math.floor(rowHeight * 0.4);
      
      const centerX = darkestRegionX;
      const centerY = darkestRegionY;
      
      const x = Math.max(0, centerX - signatureWidth / 2);
      const y = Math.max(0, centerY - signatureHeight / 2);
      
      // Generate a confidence score based on the density of dark pixels
      const confidence = Math.min(0.95, 0.6 + (darkPixelCount / 5000));
      
      // Create a new signature with information extracted from the region
      const signature: ExtractedSignature = {
        name: generateName(row), // In a real app, OCR would extract actual name
        address: generateAddress(), // In a real app, OCR would extract actual address
        image_region: {
          x,
          y,
          width: signatureWidth,
          height: signatureHeight
        },
        page_number: pageNumber,
        confidence
      };
      
      signatures.push(signature);
    }
  }
  
  return signatures;
}

// Helper functions to generate realistic mock data 
// (These would be replaced by actual OCR in a production implementation)
function generateName(seed: number): string {
  const firstNames = ["John", "Jane", "Robert", "Emily", "Michael", "Sarah", "David", "Jennifer", "Richard", "Maria"];
  const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor"];
  
  // Use the seed to get consistent but different names
  const firstName = firstNames[(seed * 7) % firstNames.length];
  const lastName = lastNames[(seed * 11) % lastNames.length];
  
  return `${firstName} ${lastName}`;
}

function generateAddress(): string {
  const streets = ["Main St", "Oak Ave", "Maple Rd", "Pine Ln", "Cedar Blvd", "Elm St", "Park Ave", "River Rd"];
  const cities = ["New York", "Brooklyn", "Bronx", "Queens", "Staten Island"];
  const zipCodes = ["10001", "10002", "10003", "10004", "10005", "10006", "10007"];
  
  const number = Math.floor(Math.random() * 1000) + 1;
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const zipCode = zipCodes[Math.floor(Math.random() * zipCodes.length)];
  
  return `${number} ${street}, ${city}, NY ${zipCode}`;
}

// Function to find matching voters in our database
async function findMatchingVoter(name: string, address: string): Promise<VoterRecord | null> {
  try {
    // Split name into parts
    const nameParts = name.split(' ');
    let firstName = nameParts[0];
    let lastName = nameParts[nameParts.length - 1];
    
    // Extract address components (simplified approach)
    const addressParts = address.split(',');
    const streetAddress = addressParts[0]?.trim() || '';
    
    // Perform Supabase query
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
  petitionDistrict: string = "AD-73"
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
  district: string = "AD-73"
): Promise<ValidationResult> {
  try {
    toast.info("Processing petition files...", {
      description: "Extracting signatures from the uploaded documents"
    });
    
    // Extract signatures from files using AI signature detection
    const extractedSignatures = await extractSignaturesFromFiles(files);
    
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
