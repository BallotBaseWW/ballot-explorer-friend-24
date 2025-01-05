import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { AdvancedSearch } from "./AdvancedSearch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const Hero = () => {
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleBasicSearch = async (query: string) => {
    if (query.length >= 3) {
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
      }
    }
  };

  const handleAdvancedSearch = async (filters: Record<string, string>) => {
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
    }
  };

  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-[#33C3F0] via-[#8E77B5] to-[#ea384c] opacity-5 -z-10" />
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
        <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
          BallotBase
        </span>
      </h1>
      <p className="text-lg md:text-xl text-neutral mb-8 text-center max-w-2xl">
        Search and discover voter information with ease
      </p>
      <div className="w-full max-w-2xl space-y-4">
        <SearchBar onSearch={handleBasicSearch} placeholder="Search by last name (min. 3 characters)..." />
        <AdvancedSearch onSearch={handleAdvancedSearch} />
      </div>
      
      {searchResults.length > 0 && (
        <div className="w-full max-w-6xl mt-8 px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((voter) => (
                    <tr key={voter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {voter.first_name} {voter.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{voter.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{voter.registered_party}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          voter.voter_status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {voter.voter_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};