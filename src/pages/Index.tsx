import { useState } from "react";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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

      // Add filters to the query
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 md:p-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xl font-semibold text-primary">BB</div>
          <div className="flex gap-4 items-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4">
        <Hero />
        <div className="mt-8 space-y-4">
          <SearchBar onSearch={handleBasicSearch} placeholder="Search by last name (min. 3 characters)..." />
          <AdvancedSearch onSearch={handleAdvancedSearch} />
          
          {/* Display search results */}
          {searchResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Search Results ({searchResults.length})</h2>
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((voter) => (
                      <tr key={voter.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {voter.first_name} {voter.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{voter.city}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{voter.registered_party}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="py-8 text-center text-neutral text-sm">
        <p>© 2024 BallotBase. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;