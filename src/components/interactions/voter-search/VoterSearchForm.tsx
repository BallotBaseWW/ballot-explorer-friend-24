import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { County } from "@/components/search/list-utils/types";

interface VoterSearchFormProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  selectedCounty: County | null;
}

export const VoterSearchForm = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  isSearching,
  selectedCounty
}: VoterSearchFormProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Search by voter ID (e.g., NY123456789) or enter first and last name
      </p>
      <div className="flex gap-2">
        <Input
          placeholder={selectedCounty ? "Enter NYS Voter ID or full name" : "Please select a county first"}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          disabled={!selectedCounty || isSearching}
        />
        <Button 
          onClick={onSearch}
          disabled={!searchQuery || !selectedCounty || isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>
    </div>
  );
};