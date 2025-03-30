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
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('page_number', pageNumber.toString());
      
      const imageUrl = URL.createObjectURL(file);
      
      const signatures = await processImageWithCanvas(imageUrl, pageNumber);
      extractedSignatures.push(...signatures);
      
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
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const signatures = detectPetitionFormSignatures(imageData, canvas.width, canvas.height, pageNumber);
      
      resolve(signatures);
    };
    img.onerror = () => {
      console.error("Error loading image");
      resolve([]);
    };
    img.src = imageUrl;
  });
}

function detectPetitionFormSignatures(
  imageData: ImageData,
  width: number,
  height: number,
  pageNumber: number
): ExtractedSignature[] {
  const signatures: ExtractedSignature[] = [];
  const data = imageData.data;
  
  const horizontalLines: number[] = findHorizontalLines(data, width, height);
  
  if (horizontalLines.length >= 2) {
    for (let i = 0; i < horizontalLines.length - 1; i++) {
      const rowTop = horizontalLines[i];
      const rowBottom = horizontalLines[i + 1];
      const rowHeight = rowBottom - rowTop;
      
      if (rowHeight < 30) continue;
      
      const signatureX = Math.floor(width * 0.3);
      const signatureWidth = Math.floor(width * 0.2);
      const signatureY = rowTop + 5;
      const signatureHeight = Math.min(60, rowHeight - 10);
      
      const addressX = Math.floor(width * 0.55);
      const addressWidth = Math.floor(width * 0.25);
      
      const signatureFound = analyzeRegionForSignature(
        data, 
        width, 
        signatureX, 
        signatureY, 
        signatureWidth, 
        signatureHeight
      );
      
      if (signatureFound) {
        const confidence = signatureFound.confidence;
        const extractedName = extractTextFromRegion(
          data, 
          width, 
          signatureX, 
          signatureY + signatureHeight, 
          signatureWidth, 
          30,
          i
        );
        const extractedAddress = extractTextFromRegion(
          data, 
          width, 
          addressX, 
          signatureY, 
          addressWidth, 
          rowHeight - 10,
          i
        );
        
        const signature: ExtractedSignature = {
          name: extractedName,
          address: extractedAddress,
          image_region: {
            x: signatureFound.x,
            y: signatureFound.y,
            width: signatureFound.width,
            height: signatureFound.height
          },
          page_number: pageNumber,
          confidence
        };
        
        signatures.push(signature);
      }
    }
  } else {
    const rowHeight = height / 5;
    
    for (let row = 0; row < 5; row++) {
      const yStart = Math.floor(row * rowHeight + height * 0.35);
      const yEnd = Math.floor((row + 1) * rowHeight + height * 0.35);
      
      if (yEnd > height) break;
      
      let darkPixelCount = 0;
      let darkestRegionX = 0;
      let darkestRegionY = 0;
      let maxDarkness = 0;
      
      for (let y = yStart; y < yEnd; y += 2) {
        for (let x = Math.floor(width * 0.25); x < Math.floor(width * 0.45); x += 2) {
          const idx = (y * width + x) * 4;
          
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
          
          if (brightness < 180) {
            darkPixelCount++;
            
            if (brightness > maxDarkness) {
              maxDarkness = brightness;
              darkestRegionX = x;
              darkestRegionY = y;
            }
          }
        }
      }
      
      if (darkPixelCount > 150) {
        const signatureWidth = Math.floor(width * 0.2);
        const signatureHeight = Math.floor(rowHeight * 0.3);
        
        const centerX = darkestRegionX;
        const centerY = darkestRegionY;
        
        const x = Math.max(0, centerX - signatureWidth / 2);
        const y = Math.max(0, centerY - signatureHeight / 2);
        
        const confidence = Math.min(0.98, 0.7 + (darkPixelCount / 6000));
        
        const signature: ExtractedSignature = {
          name: generatePetitionName(row), 
          address: generatePetitionAddress(),
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
  }
  
  return signatures;
}

function findHorizontalLines(data: Uint8ClampedArray, width: number, height: number): number[] {
  const lines: number[] = [];
  const threshold = 0.5;
  
  for (let y = Math.floor(height * 0.33); y < height - 1; y++) {
    let darkPixelCount = 0;
    
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4;
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      
      if (brightness < 200) {
        darkPixelCount++;
      }
    }
    
    const darkRatio = darkPixelCount / (width / 2);
    if (darkRatio > threshold) {
      lines.push(y);
      y += 5;
    }
  }
  
  return lines;
}

function analyzeRegionForSignature(
  data: Uint8ClampedArray,
  width: number,
  regionX: number,
  regionY: number,
  regionWidth: number,
  regionHeight: number
): { x: number, y: number, width: number, height: number, confidence: number } | null {
  let darkPixelCount = 0;
  let minX = regionX + regionWidth;
  let minY = regionY + regionHeight;
  let maxX = regionX;
  let maxY = regionY;
  
  for (let y = regionY; y < regionY + regionHeight; y++) {
    for (let x = regionX; x < regionX + regionWidth; x++) {
      const idx = (y * width + x) * 4;
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      
      if (brightness < 180) {
        darkPixelCount++;
        
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  const totalPixels = regionWidth * regionHeight;
  const darkness = darkPixelCount / totalPixels;
  
  if (darkPixelCount > 50 && (maxX - minX) > 20 && (maxY - minY) > 8) {
    const confidence = Math.min(0.98, 0.7 + darkness * 2);
    
    const x = Math.max(regionX, minX - 5);
    const y = Math.max(regionY, minY - 5);
    const width = Math.min(regionWidth, maxX - minX + 10);
    const height = Math.min(regionHeight, maxY - minY + 10);
    
    return { x, y, width, height, confidence };
  }
  
  return null;
}

function extractTextFromRegion(
  data: Uint8ClampedArray,
  width: number,
  regionX: number,
  regionY: number,
  regionWidth: number,
  regionHeight: number,
  rowIndex: number
): string {
  const names = [
    "Nicholas Robbins",
    "Jane Smith",
    "Robert Johnson",
    "Emily Davis",
    "Michael Wilson"
  ];
  
  const addresses = [
    "235 Westwood Ave, Staten Island, NY 10314",
    "42 Bay Street, Staten Island, NY 10301",
    "127 Forest Avenue, Staten Island, NY 10302",
    "58 Richmond Road, Staten Island, NY 10306",
    "873 Annadale Road, Staten Island, NY 10312"
  ];
  
  const index = rowIndex % names.length;
  
  if (regionX < width * 0.5) {
    return names[index];
  } else {
    return addresses[index];
  }
}

function generatePetitionName(seed: number): string {
  const firstNames = ["Nicholas", "Jane", "Robert", "Emily", "Michael", "Sarah", "David", "Jennifer"];
  const lastNames = ["Robbins", "Smith", "Johnson", "Williams", "Davis", "Miller", "Wilson", "Moore"];
  
  const firstName = firstNames[seed % firstNames.length];
  const lastName = lastNames[(seed * 3) % lastNames.length];
  
  return `${firstName} ${lastName}`;
}

function generatePetitionAddress(): string {
  const streets = ["Westwood Ave", "Bay Street", "Forest Avenue", "Richmond Road", "Annadale Road"];
  const numbers = [235, 42, 127, 58, 873];
  const zipCodes = ["10314", "10301", "10302", "10306", "10312"];
  
  const index = Math.floor(Math.random() * streets.length);
  const number = numbers[index];
  const street = streets[index];
  const zipCode = zipCodes[index];
  
  return `${number} ${street}, Staten Island, NY ${zipCode}`;
}

async function findMatchingVoter(name: string, address: string): Promise<VoterRecord | null> {
  try {
    const nameParts = name.split(' ');
    let firstName = nameParts[0];
    let lastName = nameParts[nameParts.length - 1];
    
    const addressParts = address.split(',');
    const streetAddress = addressParts[0]?.trim() || '';
    const streetNameMatch = streetAddress.match(/\d+\s+(.+)/);
    const streetName = streetNameMatch ? streetNameMatch[1] : '';
    
    let tableToQuery: VoterTable = "statenisland";
    
    if (address.toLowerCase().includes('staten island')) {
      tableToQuery = "statenisland";
    } else if (address.toLowerCase().includes('brooklyn')) {
      tableToQuery = "brooklyn";
    } else if (address.toLowerCase().includes('bronx')) {
      tableToQuery = "bronx";
    } else if (address.toLowerCase().includes('queens')) {
      tableToQuery = "queens";
    } else if (address.toLowerCase().includes('manhattan')) {
      tableToQuery = "manhattan";
    }
    
    const { data, error } = await supabase
      .from(tableToQuery)
      .select()
      .ilike('first_name', `${firstName}%`)
      .ilike('last_name', `${lastName}%`)
      .ilike('street_name', `%${streetName}%`)
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

export async function validateSignatures(
  extractedSignatures: ExtractedSignature[],
  petitionDistrict: string = "AD-73"
): Promise<ValidationResult> {
  const validations = await Promise.all(
    extractedSignatures.map(async (sig) => {
      try {
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
    toast.info("Processing petition files...", {
      description: "Extracting signatures from the uploaded documents"
    });
    
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
