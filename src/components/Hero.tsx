import { useState, useCallback, useRef } from "react";
import { SearchBar } from "./SearchBar";
import { AdvancedSearch } from "./AdvancedSearch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import debounce from "lodash/debounce";
import { ChevronUp } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      // First, get the total count
      const { count, error: countError } = await supabase
        .from('voters')
        .select('*', { count: 'exact', head: true })
        .ilike('last_name', `${query}%`);

      if (countError) throw countError;
      
      // Then get the paginated results
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
    [currentPage] // Add currentPage as dependency to re-create when page changes
  );

  const handleBasicSearch = (query: string) => {
    setCurrentPage(1); // Reset to first page on new search
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
      let queryBuilder = supabase.from('voters').select();

      Object.entries(filters).forEach(([field, value]) => {
        if (value && value.length >= 3) {
          queryBuilder = queryBuilder.ilike(field, `${value}%`);
        }
      });

      // Get total count
      const { count, error: countError } = await queryBuilder.select('*', { 
        count: 'exact',
        head: true 
      });

      if (countError) throw countError;

      // Get paginated results
      const { data, error } = await queryBuilder
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
    performSearch(searchResults[0]?.last_name || ''); // Re-run search with current query
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Districts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((voter, index) => (
                    <TableRow key={`${voter.nys_state_voter_id}-${index}`}>
                      <TableCell className="font-medium">
                        {voter.first_name} {voter.middle} {voter.last_name} {voter.suffix}
                      </TableCell>
                      <TableCell>
                        {[
                          voter.house,
                          voter.street_name,
                          voter.city,
                          voter.zip_code
                        ].filter(Boolean).join(' ')}
                      </TableCell>
                      <TableCell>{voter.registered_party || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          voter.voter_status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {voter.voter_status || 'UNKNOWN'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>ED: {voter.election_district || 'N/A'}</div>
                          <div>CD: {voter.congressional_district || 'N/A'}</div>
                          <div>AD: {voter.assembly_district || 'N/A'}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                      </PaginationItem>
                    )}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            isActive={currentPage === pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
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