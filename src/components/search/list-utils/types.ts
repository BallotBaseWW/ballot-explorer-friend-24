import { Database } from "@/integrations/supabase/types";

export type County = "bronx" | "brooklyn" | "manhattan" | "queens" | "statenisland";

export type VoterList = Database["public"]["Tables"]["voter_lists"]["Row"];

export interface ListDialogProps {
  searchQuery: any;
  county: County;
}

export interface ListOperationsProps {
  county: County;
  searchQuery: any;
  listId: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
}