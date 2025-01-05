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
      let results: VoterRecord[] = [];

      if (data.basicSearch) {
        const searchTerms = data.basicSearch.trim().split(' ');
        
        if (searchTerms.length > 1) {
          // Full name search
          const firstName = searchTerms[0];
          const lastName = searchTerms[searchTerms.length - 1];
          const { data: searchData, error } = await query
            .ilike('first_name', `${firstName}%`)
            .ilike('last_name', `${lastName}%`)
            .order('last_name', { ascending: true })
            .limit(100);

          if (error) throw error;
          results = searchData || [];
        } else {
          // Last name only search
          const { data: searchData, error } = await query
            .ilike('last_name', `${data.basicSearch}%`)
            .order('last_name', { ascending: true })
            .limit(100);

          if (error) throw error;
          results = searchData || [];
        }
      } else {
        const advancedSearchParams = Object.entries(data).reduce(
          (acc: Record<string, string>, [key, value]) => {
            if (value && key !== "basicSearch") {
              acc[key] = value;
            }
            return acc;
          },
          {}
        );

        if (Object.keys(advancedSearchParams).length > 0) {
          const { data: searchData, error } = await query
            .match(advancedSearchParams)
            .order('last_name', { ascending: true })
            .limit(100);

          if (error) throw error;
          results = searchData || [];
        }
      }

      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your search criteria",
          variant: "destructive",
        });
      } else {
        toast({
          title: `Found ${results.length} results`,
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