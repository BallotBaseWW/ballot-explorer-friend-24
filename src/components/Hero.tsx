import { useState, useCallback, useRef } from "react";
import { SearchBar } from "./SearchBar";
import { AdvancedSearch } from "./AdvancedSearch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import debounce from "lodash/debounce";
import { ChevronUp } from "lucide-react";
import { SearchResults } from "./SearchResults";
import { SearchPagination } from "./SearchPagination";

export const Hero = () => {
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 20;

  const performSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setTotalCount(0);
      return;
    }

    setIsSearching(true);
    try {
      const { count } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .ilike('last_name', `${query}%`);

      const { data, error } = await supabase
        .from('voters')
        .select()
        .ilike('last_name', `${query}%`)
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      
      setSearchResults(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
      setTotalCount(0);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => performSearch(query), 300),
    [currentPage]
  );

  const handleBasicSearch = (query: string) => {
    setCurrentPage(1);
    debouncedSearch(query);
  };

  const handleAdvancedSearch = async (filters: Record<string, string>) => {
    const hasValidFilter = Object.values(filters).some(value => value.length >= 3);
    if (!hasValidFilter) {
      setSearchResults([]);
      setTotalCount(0);
      return;
    }

    setIsSearching(true);
    try {
      let query = supabase.from('voters').select('*', { count: 'exact', head: true });

      // Apply filters
      Object.entries(filters).forEach(([field, value]) => {
        if (value && value.length >= 3) {
          query = query.ilike(field, `${value}%`);
        }
      });

      const { count } = await query;

      // Separate query for paginated results
      let resultsQuery = supabase.from('voters').select();
      
      // Apply same filters to results query
      Object.entries(filters).forEach(([field, value]) => {
        if (value && value.length >= 3) {
          resultsQuery = resultsQuery.ilike(field, `${value}%`);
        }
      });

      const { data, error } = await resultsQuery
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      
      setSearchResults(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Advanced search error:', error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
      setTotalCount(0);
    } finally {
      setIsSearching(false);
    }
  };

  const scrollToTop = () => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    performSearch(searchResults[0]?.last_name || '');
    scrollToTop();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-12 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-[#33C3F0] via-[#8E77B5] to-[#ea384c] opacity-5 -z-10" />
      <div ref={searchRef}>
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
            BallotBase
          </span>
        </h1>
        <p className="text-lg md:text-xl text-neutral mb-8 text-center max-w-2xl">
          Search and discover voter information with ease
        </p>
        <div className="w-full max-w-2xl space-y-4 mb-8">
          <SearchBar onSearch={handleBasicSearch} placeholder="Search by last name (min. 3 characters)..." />
          <AdvancedSearch onSearch={handleAdvancedSearch} />
        </div>
      </div>
      
      {isSearching ? (
        <div className="w-full max-w-6xl text-center py-8">
          <div className="animate-pulse text-neutral">Searching...</div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="w-full max-w-6xl">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Found {totalCount} results
              </h2>
            </div>
            <div className="overflow-x-auto">
              <SearchResults results={searchResults} />
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <SearchPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
          {searchResults.length > 10 && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors"
              aria-label="Back to top"
            >
              <ChevronUp className="h-6 w-6" />
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};