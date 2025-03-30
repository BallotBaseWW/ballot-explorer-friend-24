export interface MatchedVoter {
  state_voter_id: string;
  first_name: string;
  last_name: string;
  address?: string;
  district?: string;
  residence_city?: string;
  zip_code?: string;
  assembly_district?: string;
  congressional_district?: string;
  state_senate_district?: string;
  enrolled_party?: string;
}

export interface SignatureValidation {
  id: number | string;
  name: string;
  address: string;
  status: "valid" | "invalid" | "uncertain";
  matched_voter?: MatchedVoter;
  reason?: string;
  confidence?: number;
  image_region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  page_number?: number;
}

export interface ValidationResultStats {
  total: number;
  valid: number;
  invalid: number;
  uncertain: number;
}

export interface ValidationResult {
  signatures: SignatureValidation[];
  stats: ValidationResultStats;
  petition_info?: {
    title?: string;
    district?: string;
    party?: string;
    candidate?: string;
    required_signatures?: number;
  };
}

export interface ExtractedSignature {
  name: string;
  address: string;
  image_region: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  page_number: number;
  confidence: number;
}

export interface PetitionProgress {
  id: string;
  name: string;
  district: string;
  party: string;
  created_at: string;
  updated_at: string;
  total_pages: number;
  completed_pages: number;
  valid_signatures: number;
  invalid_signatures: number;
  uncertain_signatures: number;
  total_signatures: number;
  required_signatures: number;
}

export interface SavePetitionRequest {
  petitionName: string;
  district: string;
  party: string;
  validationResults: ValidationResult;
  page: number;
}

export interface PetitionSignatureData {
  petitionId: string;
  signatures: SignatureValidation[];
  page_number: number;
}
