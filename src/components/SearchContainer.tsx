import { SearchBar } from "./SearchBar";
import { AdvancedSearch } from "./AdvancedSearch";
import { CitySelector } from "./CitySelector";

interface SearchContainerProps {
  selectedCity: string;
  cities: string[];
  onCityChange: (city: string) => void;
  onBasicSearch: (query: string) => void;
  onAdvancedSearch: (filters: Record<string, string>) => void;
  isLoading?: boolean;
}

export const SearchContainer = ({
  selectedCity,
  cities,
  onCityChange,
  onBasicSearch,
  onAdvancedSearch,
  isLoading = false
}: SearchContainerProps) => {
  return (
    <div className="w-full max-w-2xl space-y-4 mb-8">
      <div className="w-full">
        <CitySelector
          selectedCity={selectedCity}
          cities={cities}
          onCityChange={onCityChange}
        />
        <div className="mt-4">
          <SearchBar 
            onSearch={onBasicSearch} 
            placeholder={selectedCity ? "Search by last name (min. 3 characters)..." : "Select a city first..."} 
            disabled={!selectedCity || isLoading}
          />
        </div>
      </div>
      <AdvancedSearch onSearch={onAdvancedSearch} />
    </div>
  );
};