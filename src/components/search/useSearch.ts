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

      // Debug log the raw form data
      console.log('Search form data:', data);

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

      // Party filter - only apply if not "all"
      if (data.enrolled_party && data.enrolled_party !== "all") {
        console.log('Applying party filter:', data.enrolled_party);
        // First, let's check what values exist in the database for this field
        const { data: partyValues } = await supabase
          .from(countyTable)
          .select('enrolled_party')
          .eq('enrolled_party', data.enrolled_party)
          .limit(1);
        console.log('Sample party values in DB:', partyValues);
        
        query = query.eq('enrolled_party', data.enrolled_party);
      }

      // District filters
      if (data.assembly_district) {
        console.log('Applying assembly district filter:', data.assembly_district);
        // Check what values exist in the database for this field
        const { data: districtValues } = await supabase
          .from(countyTable)
          .select('assembly_district')
          .eq('assembly_district', data.assembly_district)
          .limit(1);
        console.log('Sample assembly district values in DB:', districtValues);
        
        query = query.eq('assembly_district', data.assembly_district);
      }
      if (data.state_senate_district) {
        query = query.eq('state_senate_district', data.state_senate_district);
      }
      if (data.congressional_district) {
        query = query.eq('congressional_district', data.congressional_district);
      }

      // Voter status filter - only apply if not "all"
      if (data.voter_status && data.voter_status !== "all") {
        console.log('Applying voter status filter:', data.voter_status);
        // Check what values exist in the database for this field
        const { data: statusValues } = await supabase
          .from(countyTable)
          .select('voter_status')
          .eq('voter_status', data.voter_status)
          .limit(1);
        console.log('Sample voter status values in DB:', statusValues);
        
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

      // Log the final query for debugging
      console.log('Final query:', query);

      // Execute query with limit and order
      const { data: searchData, error } = await query
        .order('last_name', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Search error:', error);
        throw error;
      }
      
      console.log('Raw search results:', searchData);
      console.log('Number of results:', searchData?.length);
      
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