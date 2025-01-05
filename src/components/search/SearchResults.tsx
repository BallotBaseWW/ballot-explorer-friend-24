import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { printVoterRecord } from "./voter-sections/printUtils";
import { VoterCard } from "./voter-card/VoterCard";
import { PaginationControls } from "./pagination/PaginationControls";
import { Button } from "@/components/ui/button";
import { ArrowUp, ListPlus } from "lucide-react";
import { AddAllToListDialog } from "./AddAllToListDialog";
import { County } from "./types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

interface SearchResultsProps {
  results: VoterRecord[];
  county: County;
  searchQuery: any; // This will be used to fetch all results
}

const ITEMS_PER_PAGE = 20;

export const SearchResults = ({ results, county, searchQuery }: SearchResultsProps) => {
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Search Results
          {results.length >= 100 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Showing first 100 matches)
            </span>
          )}
        </h2>
        <AddAllToListDialog searchQuery={searchQuery} county={county} />
      </div>

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

      <div className="mt-8 space-y-4">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            className="flex items-center gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Return to Top
          </Button>
        </div>
      </div>
    </div>
  );
};