import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { printVoterRecord } from "./voter-sections/printUtils";
import { VoterCard } from "./voter-card/VoterCard";
import { PaginationControls } from "./pagination/PaginationControls";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

interface SearchResultsProps {
  results: VoterRecord[];
  county: string;
}

const ITEMS_PER_PAGE = 20;

export const SearchResults = ({ results, county }: SearchResultsProps) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  if (results.length === 0) return null;

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = results.slice(startIndex, endIndex);

  const handlePrint = async (voter: VoterRecord) => {
    try {
      await printVoterRecord(voter);
      toast({
        title: "Success",
        description: "PDF generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Search Results</h2>
      <div className="space-y-4">
        {currentResults.map((voter, index) => (
          <VoterCard
            key={index}
            voter={voter}
            county={county}
            onPrint={handlePrint}
          />
        ))}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};