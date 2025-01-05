import { supabase } from "@/integrations/supabase/client";
import { County } from "./types";

export const fetchVoterIds = async (county: County, searchQuery: any) => {
  const PAGE_SIZE = 1000;
  let allVoterIds: string[] = [];
  let hasMore = true;
  let from = 0;

  while (hasMore) {
    // Build query with pagination
    const query = supabase
      .from(county)
      .select('state_voter_id')
      .range(from, from + PAGE_SIZE - 1);
    
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
    
    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allVoterIds = [...allVoterIds, ...data.map(v => v.state_voter_id)];
      from += PAGE_SIZE;
      
      // Check if we got less than PAGE_SIZE results
      if (data.length < PAGE_SIZE) {
        hasMore = false;
      }
    }
  }

  console.log(`Total voter IDs fetched: ${allVoterIds.length}`);
  return allVoterIds;
};