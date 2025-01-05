import { supabase } from "@/integrations/supabase/client";
import { County } from "./types";

export const fetchVoterIds = async (county: County, searchQuery: any) => {
  // Remove the limit to get all results
  const query = supabase.from(county).select('state_voter_id');
  
  // Apply all the search filters from the original query
  Object.entries(searchQuery).forEach(([key, value]) => {
    if (value && key !== 'basicSearch') {
      query.eq(key, value);
    }
  });

  if (searchQuery.basicSearch) {
    const searchTerms = searchQuery.basicSearch.trim().split(' ');
    if (searchTerms.length > 1) {
      const firstName = searchTerms[0];
      const lastName = searchTerms[searchTerms.length - 1];
      query.ilike('first_name', `${firstName}%`)
           .ilike('last_name', `${lastName}%`);
    } else {
      query.ilike('last_name', `${searchQuery.basicSearch}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data.map(v => v.state_voter_id);
};