
import { County } from "@/components/search/types";

export interface Candidate {
  id: string;
  name: string;
  position: string;
  residence: string;
  voterData?: any;
}

export interface CommitteeMember {
  id: string;
  name: string;
  residence: string;
  voterData?: any;
}

export interface PetitionData {
  party: string;
  electionDate: string;
  electionYear: string;
  candidates: Candidate[];
  committeeMembers: CommitteeMember[];
  committee?: string; // Keeping for backward compatibility
  showNotary: boolean;
  showWitness: boolean;
  signatureCount: number;
}

export interface VoterSearchDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelectVoter: (voter: any, county: County) => void;
}

export interface CandidateFormProps {
  candidate: Candidate;
  index: number;
  onUpdate: (index: number, updatedCandidate: Candidate) => void;
  onRemove: (index: number) => void;
  onSearch: () => void;
}

export interface PetitionWizardProps {
  petitionData: PetitionData;
  setPetitionData: (data: PetitionData) => void;
}

export interface CommitteeMemberFormProps {
  member: CommitteeMember;
  index: number;
  onUpdate: (index: number, updatedMember: CommitteeMember) => void;
  onRemove: (index: number) => void;
  onSearch: () => void;
}

export interface WizardStepProps {
  petitionData: PetitionData;
  updatePetitionData: (data: Partial<PetitionData>) => void;
  onNext: () => void;
  onBack?: () => void;
}
