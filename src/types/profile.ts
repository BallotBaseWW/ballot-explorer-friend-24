import { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
type ProfileBase = Database["public"]["Tables"]["profiles"]["Row"];

export interface Profile extends ProfileBase {
  user_roles?: UserRole | UserRole[];
}