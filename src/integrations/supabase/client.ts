// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://scazhuhtxhiqymfiwvnm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjYXpodWh0eGhpcXltZml3dm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwOTI3NzIsImV4cCI6MjA1MTY2ODc3Mn0.hG_axD0TJEs2TGWtv2IfyWc_-biAnayPta5VY0JSG9w";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);