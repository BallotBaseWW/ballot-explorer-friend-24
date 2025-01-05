import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { AdvancedSearch } from "./AdvancedSearch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

  const handleBasicSearch = async (query: string) => {
    if (query.length >= 3) {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('voters')
          .select()
          .ilike('last_name', `${query}%`)
          .limit(50);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        toast({
          title: "Search Error",
          description: "An error occurred while searching. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAdvancedSearch = async (filters: Record<string, string>) => {
    setIsSearching(true);
    try {
      let query = supabase.from('voters').select();

      Object.entries(filters).forEach(([field, value]) => {
        if (value) {
          query = query.ilike(field, `${value}%`);
        }
      });

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-12 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-[#33C3F0] via-[#8E77B5] to-[#ea384c] opacity-5 -z-10" />
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
      
      {isSearching ? (
        <div className="w-full max-w-6xl text-center py-8">
          <div className="animate-pulse text-neutral">Searching...</div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="w-full max-w-6xl">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Found {searchResults.length} results
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
          </div>
        </div>
      ) : null}
    </div>
  );
};