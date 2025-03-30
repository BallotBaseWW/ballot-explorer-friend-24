
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PetitionProgress, PetitionSignatureData, SavePetitionRequest, SignatureValidation } from "./types";

export async function savePetitionPage(request: SavePetitionRequest): Promise<string> {
  try {
    const { petitionName, district, party, validationResults, page } = request;
    const stats = validationResults.stats;
    
    let petitionId: string;
    
    // Check if petition already exists
    const { data: existingPetitions, error: findError } = await supabase
      .from('petitions')
      .select('id, total_pages, valid_signatures, invalid_signatures, uncertain_signatures, total_signatures')
      .eq('name', petitionName)
      .single();
    
    if (findError && findError.code !== 'PGRST116') {
      console.error('Error checking existing petition:', findError);
      toast.error("Error saving petition", {
        description: "Could not check if petition already exists"
      });
      throw findError;
    }
    
    const isNewPetition = !existingPetitions;
    
    if (isNewPetition) {
      // Create new petition
      const { data: newPetition, error: createError } = await supabase
        .from('petitions')
        .insert({
          name: petitionName,
          district: district,
          party: party,
          valid_signatures: stats.valid,
          invalid_signatures: stats.invalid,
          uncertain_signatures: stats.uncertain,
          total_signatures: stats.total,
          total_pages: 1,
          completed_pages: 1,
          required_signatures: 500 // Default, can be configurable
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error('Error creating petition:', createError);
        toast.error("Error creating petition", {
          description: "Could not create new petition record"
        });
        throw createError;
      }
      
      petitionId = newPetition.id;
      
      toast.success("New petition created", {
        description: `Created petition "${petitionName}" with ${stats.total} signatures`
      });
    } else {
      // Update existing petition
      petitionId = existingPetitions.id;
      const isPageAlreadyProcessed = await isPageProcessed(petitionId, page);
      
      if (!isPageAlreadyProcessed) {
        // Only update counts if page wasn't previously processed
        const { error: updateError } = await supabase
          .from('petitions')
          .update({
            valid_signatures: existingPetitions.valid_signatures + stats.valid,
            invalid_signatures: existingPetitions.invalid_signatures + stats.invalid,
            uncertain_signatures: existingPetitions.uncertain_signatures + stats.uncertain,
            total_signatures: existingPetitions.total_signatures + stats.total,
            total_pages: existingPetitions.total_pages + 1,
            completed_pages: existingPetitions.completed_pages + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', petitionId);
        
        if (updateError) {
          console.error('Error updating petition:', updateError);
          toast.error("Error updating petition", {
            description: "Could not update petition statistics"
          });
          throw updateError;
        }
        
        toast.success("Petition updated", {
          description: `Added page ${page} with ${stats.total} signatures to "${petitionName}"`
        });
      } else {
        toast.info("Page already processed", {
          description: `Page ${page} was already added to this petition`
        });
      }
    }
    
    // Save the signature data if not already saved
    if (isNewPetition || !(await isPageProcessed(petitionId, page))) {
      await saveSignatureData({
        petitionId,
        signatures: validationResults.signatures,
        page_number: page
      });
    }
    
    return petitionId;
  } catch (error) {
    console.error("Error in savePetitionPage:", error);
    toast.error("Failed to save petition page", {
      description: error instanceof Error ? error.message : "Unknown error occurred"
    });
    throw error;
  }
}

async function isPageProcessed(petitionId: string, pageNumber: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('petition_signatures')
    .select('id')
    .eq('petition_id', petitionId)
    .eq('page_number', pageNumber)
    .limit(1);
  
  if (error) {
    console.error('Error checking if page is processed:', error);
    return false;
  }
  
  return data && data.length > 0;
}

async function saveSignatureData(data: PetitionSignatureData): Promise<void> {
  try {
    const { petitionId, signatures, page_number } = data;
    
    // Insert all signatures for this page
    const signatureRecords = signatures.map(sig => ({
      petition_id: petitionId,
      page_number: page_number,
      name: sig.name,
      address: sig.address,
      status: sig.status,
      reason: sig.reason || null,
      confidence: sig.confidence || null,
      state_voter_id: sig.matched_voter?.state_voter_id || null,
      county: detectCounty(sig.address),
      image_region: sig.image_region ? JSON.stringify(sig.image_region) : null
    }));
    
    const { error } = await supabase
      .from('petition_signatures')
      .insert(signatureRecords);
    
    if (error) {
      console.error('Error saving signature data:', error);
      toast.error("Error saving signatures", {
        description: "Could not save signature details"
      });
      throw error;
    }
  } catch (error) {
    console.error("Error in saveSignatureData:", error);
    throw error;
  }
}

function detectCounty(address: string): string {
  // Simple county detection based on address
  const lowercaseAddress = address.toLowerCase();
  
  if (lowercaseAddress.includes('staten island') || lowercaseAddress.includes('richmond')) {
    return 'statenisland';
  } else if (lowercaseAddress.includes('brooklyn') || lowercaseAddress.includes('kings')) {
    return 'brooklyn';
  } else if (lowercaseAddress.includes('bronx')) {
    return 'bronx';
  } else if (lowercaseAddress.includes('queens')) {
    return 'queens';
  } else if (lowercaseAddress.includes('manhattan') || lowercaseAddress.includes('new york, ny')) {
    return 'manhattan';
  }
  
  // Default to staten island if no match
  return 'statenisland';
}

export async function getPetitions(): Promise<PetitionProgress[]> {
  try {
    const { data, error } = await supabase
      .from('petitions')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching petitions:', error);
      toast.error("Error loading petitions", {
        description: "Could not retrieve petition list"
      });
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getPetitions:", error);
    return [];
  }
}

export async function getPetitionById(id: string): Promise<PetitionProgress | null> {
  try {
    const { data, error } = await supabase
      .from('petitions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching petition:', error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error("Error in getPetitionById:", error);
    return null;
  }
}

export async function getPetitionSignatures(petitionId: string, page?: number): Promise<SignatureValidation[]> {
  try {
    let query = supabase
      .from('petition_signatures')
      .select('*')
      .eq('petition_id', petitionId);
    
    if (page !== undefined) {
      query = query.eq('page_number', page);
    }
    
    const { data, error } = await query.order('page_number', { ascending: true });
    
    if (error) {
      console.error('Error fetching petition signatures:', error);
      toast.error("Error loading signatures", {
        description: "Could not retrieve signature data"
      });
      return [];
    }
    
    // Convert database records to SignatureValidation format
    return (data || []).map(record => ({
      id: record.id,
      name: record.name,
      address: record.address,
      status: record.status,
      reason: record.reason || undefined,
      confidence: record.confidence || undefined,
      matched_voter: record.state_voter_id ? {
        state_voter_id: record.state_voter_id,
        first_name: '', // These will be filled in from the voter query if needed
        last_name: ''
      } : undefined,
      page_number: record.page_number,
      image_region: record.image_region ? JSON.parse(record.image_region) : undefined
    }));
  } catch (error) {
    console.error("Error in getPetitionSignatures:", error);
    return [];
  }
}
