import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CitySelectorProps {
  selectedCity: string;
  cities: string[];
  onCityChange: (city: string) => void;
  disabled?: boolean;
}

export const CitySelector = ({
  selectedCity,
  cities,
  onCityChange,
  disabled = false
}: CitySelectorProps) => {
  return (
    <Select
      value={selectedCity}
      onValueChange={onCityChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a city first..." />
      </SelectTrigger>
      <SelectContent>
        {cities.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};