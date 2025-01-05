import { Database } from "@/integrations/supabase/types";

export type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

export interface ExportDialogProps {
  voters: Array<VoterRecord & { county: string }>;
  listName: string;
}