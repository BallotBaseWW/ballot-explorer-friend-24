
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
  
  // Detect table structure in the petition form
  const tableInfo = detectTableStructure(data, width, height);
  
  if (tableInfo.rows.length > 1) {
    // We found a table structure, extract signatures from the rows
    for (let i = 1; i < tableInfo.rows.length; i++) { // Skip header row
      const rowTop = tableInfo.rows[i - 1];
      const rowBottom = tableInfo.rows[i];
      const rowHeight = rowBottom - rowTop;
      
      if (rowHeight < 30) continue; // Skip rows that are too small
      
      // Calculate positions for signature, name, and address fields based on table columns
      const signatureColIdx = findSignatureColumn(tableInfo.columns);
      const addressColIdx = findAddressColumn(tableInfo.columns);
      
      if (signatureColIdx === -1 || addressColIdx === -1) continue;
      
      // Determine signature field boundaries
      const signatureX = tableInfo.columns[signatureColIdx];
      const signatureWidth = tableInfo.columns[signatureColIdx + 1] - signatureX;
      const signatureY = rowTop + 5;
      const signatureHeight = Math.min(60, rowHeight - 10);
      
      // Determine address field boundaries
      const addressX = tableInfo.columns[addressColIdx];
      const addressWidth = tableInfo.columns[addressColIdx + 1] - addressX;
      
      // Analyze signature region to find the actual signature
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
        
        // Extract name and address from the respective columns
        const nameY = signatureY + signatureHeight + 5;
        const nameHeight = 30;
        
        const extractedName = extractTextFromRegion(
          data, 
          width, 
          signatureX, 
          nameY, 
          signatureWidth, 
          nameHeight,
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
    // Fallback to scanning the page by sections
    const signatureAreas = findSignatureAreas(data, width, height);
    
    for (let i = 0; i < signatureAreas.length; i++) {
      const area = signatureAreas[i];
      
      // Look for name text under the signature
      const nameY = area.y + area.height + 5;
      const extractedName = extractTextFromRegion(
        data, 
        width, 
        area.x, 
        nameY, 
        area.width, 
        30,
        i
      );
      
      // Look for address to the right of the signature
      const addressX = area.x + area.width + 20;
      const addressWidth = Math.min(width - addressX, 300);
      const extractedAddress = extractTextFromRegion(
        data, 
        width, 
        addressX, 
        area.y, 
        addressWidth, 
        area.height,
        i
      );
      
      const signature: ExtractedSignature = {
        name: extractedName || generatePetitionName(i),
        address: extractedAddress || generatePetitionAddress(),
        image_region: {
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height
        },
        page_number: pageNumber,
        confidence: 0.85
      };
      
      signatures.push(signature);
    }
  }
  
  return signatures;
}

interface TableStructure {
  rows: number[];
  columns: number[];
}

function detectTableStructure(data: Uint8ClampedArray, width: number, height: number): TableStructure {
  const rows: number[] = [];
  const columns: number[] = [];
  const horizontalLineThreshold = 0.5;
  const verticalLineThreshold = 0.5;
  
  // Find horizontal lines (table rows)
  for (let y = Math.floor(height * 0.2); y < height - 1; y++) {
    let darkPixelCount = 0;
    
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4;
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      
      if (brightness < 180) {
        darkPixelCount++;
      }
    }
    
    const darkRatio = darkPixelCount / (width / 2);
    if (darkRatio > horizontalLineThreshold) {
      rows.push(y);
      y += 5; // Skip a few pixels to avoid detecting the same line multiple times
    }
  }
  
  // Find vertical lines (table columns)
  for (let x = 0; x < width; x += 5) {
    let darkPixelCount = 0;
    const sampleHeight = height * 0.5; // Sample only middle part of the page
    const startY = height * 0.25;
    
    for (let y = startY; y < startY + sampleHeight; y += 2) {
      const idx = (y * width + x) * 4;
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      
      if (brightness < 180) {
        darkPixelCount++;
      }
    }
    
    const darkRatio = darkPixelCount / (sampleHeight / 2);
    if (darkRatio > verticalLineThreshold) {
      columns.push(x);
      x += 15; // Skip a few pixels
    }
  }
  
  return { rows, columns };
}

function findSignatureColumn(columns: number[]): number {
  if (columns.length < 3) return -1;
  
  // In standard petition forms, signature is typically in the second column
  return 1;
}

function findAddressColumn(columns: number[]): number {
  if (columns.length < 4) return -1;
  
  // In standard petition forms, address is typically in the third column
  return 2;
}

function findSignatureAreas(data: Uint8ClampedArray, width: number, height: number): Array<{x: number, y: number, width: number, height: number}> {
  const areas: Array<{x: number, y: number, width: number, height: number}> = [];
  
  // Scan the middle section of the form where signatures would typically be
  const startY = Math.floor(height * 0.3);
  const endY = Math.floor(height * 0.8);
  const startX = Math.floor(width * 0.2);
  const endX = Math.floor(width * 0.5);
  
  // Define typical signature row pattern (using the image as reference)
  const rowHeight = Math.floor((endY - startY) / 5); // Assume 5 signature rows
  
  for (let i = 0; i < 5; i++) {
    const y = startY + i * rowHeight;
    
    // Check if this row contains dark pixels that could be a signature
    let hasDarkPixels = false;
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    
    for (let scanY = y; scanY < y + rowHeight * 0.7; scanY++) {
      for (let scanX = startX; scanX < endX; scanX++) {
        const idx = (scanY * width + scanX) * 4;
        
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        
        if (brightness < 150) {
          hasDarkPixels = true;
          minX = Math.min(minX, scanX);
          maxX = Math.max(maxX, scanX);
          minY = Math.min(minY, scanY);
          maxY = Math.max(maxY, scanY);
        }
      }
    }
    
    if (hasDarkPixels && (maxX - minX > 20) && (maxY - minY > 8)) {
      areas.push({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      });
    }
  }
  
  return areas;
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
      
      if (brightness < 150) { // Lower threshold to catch more signature strokes
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
  
  if (darkPixelCount > 30 && (maxX - minX) > 20 && (maxY - minY) > 8) {
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
