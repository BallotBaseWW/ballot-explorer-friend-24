import { County } from "@/components/search/list-utils/types";

const counties = [
  { id: "bronx", name: "Bronx" },
  { id: "brooklyn", name: "Brooklyn" },
  { id: "manhattan", name: "Manhattan" },
  { id: "queens", name: "Queens" },
  { id: "statenisland", name: "Staten Island" }
];

interface CountySelectorProps {
  onCountySelect: (county: County) => void;
  selectedCounty: County | null;
}

export const CountySelector = ({ onCountySelect, selectedCounty }: CountySelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {counties.map((county) => (
        <button
          key={county.id}
          onClick={() => onCountySelect(county.id as County)}
          className={`p-3 rounded-lg border transition-colors ${
            selectedCounty === county.id
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
        >
          {county.name}
        </button>
      ))}
    </div>
  );
};