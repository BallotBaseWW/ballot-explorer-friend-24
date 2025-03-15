
import { County } from "@/components/search/types";

export interface Candidate {
  id: string;
  name: string;
  position: string;
  residence: string;
  voterData?: any;
}

export interface PetitionData {
  party: string;
  electionDate: string;
  electionYear: string;
  candidates: Candidate[];
  committee: string;
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
  onSearch: (index: number) => void;
}
