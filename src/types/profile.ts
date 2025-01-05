import { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
type ProfileBase = Database["public"]["Tables"]["profiles"]["Row"];

export interface Profile {
  id: ProfileBase["id"];
  email: ProfileBase["email"];
  full_name: ProfileBase["full_name"];
  approved: ProfileBase["approved"];
  created_at: ProfileBase["created_at"];
  updated_at: ProfileBase["updated_at"];
  user_roles: { role: UserRole["role"] }[];
}