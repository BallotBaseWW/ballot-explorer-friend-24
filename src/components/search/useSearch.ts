import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SearchFormValues, County } from "./types";
import { Database } from "@/integrations/supabase/types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

export const useSearch = (county: string) => {
  const [searchResults, setSearchResults] = useState<VoterRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const performSearch = async (data: SearchFormValues) => {
    setIsLoading(true);
    setSearchResults([]);
    
    try {
      const countyTable = county.toLowerCase() as County;
      let query = supabase.from(countyTable).select();

      // Basic search handling
      if (data.basicSearch) {
        const searchTerms = data.basicSearch.trim().split(' ');
        if (searchTerms.length > 1) {
          const firstName = searchTerms[0];
          const lastName = searchTerms[searchTerms.length - 1];
          query = query
            .ilike('first_name', `${firstName}%`)
            .ilike('last_name', `${lastName}%`);
        } else {
          query = query.ilike('last_name', `${data.basicSearch}%`);
        }
      }

      // Age range filter
      if (data.minAge || data.maxAge) {
        const today = new Date();
        const year = today.getFullYear();

        if (data.minAge) {
          const maxYear = year - parseInt(data.minAge);
          query = query.lte('date_of_birth', maxYear.toString());
        }
        if (data.maxAge) {
          const minYear = year - parseInt(data.maxAge);
          query = query.gte('date_of_birth', minYear.toString());
        }
      }

      // Party filter
      if (data.enrolled_party) {
        query = query.eq('enrolled_party', data.enrolled_party);
      }

      // District filters
      if (data.assembly_district) {
        query = query.eq('assembly_district', data.assembly_district);
      }
      if (data.state_senate_district) {
        query = query.eq('state_senate_district', data.state_senate_district);
      }
      if (data.congressional_district) {
        query = query.eq('congressional_district', data.congressional_district);
      }

      // Voter status filter
      if (data.voter_status) {
        query = query.eq('voter_status', data.voter_status);
      }

      // Name filters
      if (data.last_name) query = query.ilike('last_name', `${data.last_name}%`);
      if (data.first_name) query = query.ilike('first_name', `${data.first_name}%`);
      if (data.middle) query = query.ilike('middle', `${data.middle}%`);

      // Address filters
      if (data.house) query = query.eq('house', data.house);
      if (data.street_name) query = query.ilike('street_name', `${data.street_name}%`);
      if (data.zip_code) query = query.eq('zip_code', data.zip_code);

      // Execute query with limit and order
      const { data: searchData, error } = await query
        .order('last_name', { ascending: true })
        .limit(100);

      if (error) throw error;
      
      setSearchResults(searchData || []);
      
      if (searchData.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your search criteria",
          variant: "destructive",
        });
      } else {
        toast({
          title: `Found ${searchData.length} results`,
          description: "Displaying search results below",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error performing search",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchResults,
    isLoading,
    performSearch,
  };
};