import { SearchBar } from "./SearchBar";
import { AdvancedSearch } from "./AdvancedSearch";

interface SearchContainerProps {
  onBasicSearch: (field: string, value: string) => void;
  onAdvancedSearch: (filters: Record<string, string>) => void;
  isLoading?: boolean;
  searchCriteria: {
    first_name: string;
    last_name: string;
  };
}

export const SearchContainer = ({
  onBasicSearch,
  onAdvancedSearch,
  isLoading = false,
  searchCriteria
}: SearchContainerProps) => {
  const canSearch = searchCriteria.first_name.length >= 3 && searchCriteria.last_name.length >= 3;

  return (
    <div className="w-full max-w-2xl space-y-4 mb-8">
      <div className="w-full space-y-4">
        <SearchBar 
          onSearch={onBasicSearch}
          placeholder="Enter first name (min. 3 characters)..."
          disabled={isLoading}
          label="First Name"
        />
        <SearchBar 
          onSearch={onBasicSearch}
          placeholder="Enter last name (min. 3 characters)..."
          disabled={isLoading}
          label="Last Name"
        />
        {!canSearch && (
          <p className="text-sm text-amber-600">
            Please enter at least 3 characters for both first and last name to search.
          </p>
        )}
      </div>
      <AdvancedSearch onSearch={onAdvancedSearch} />
    </div>
  );
};