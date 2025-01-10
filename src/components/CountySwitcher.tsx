import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { County } from "./search/types";

const counties = [
  { id: "brooklyn", name: "Brooklyn" },
  { id: "queens", name: "Queens" },
  { id: "manhattan", name: "Manhattan" },
  { id: "bronx", name: "Bronx" },
  { id: "statenisland", name: "Staten Island" }
];

interface CountySwitcherProps {
  currentCounty: County;
}

export const CountySwitcher = ({ currentCounty }: CountySwitcherProps) => {
  const navigate = useNavigate();

  const handleCountyChange = (value: string) => {
    navigate(`/search/${value}`);
  };

  const getCurrentCountyName = () => {
    const county = counties.find(c => c.id === currentCounty);
    return county ? county.name : '';
  };

  return (
    <Select defaultValue={currentCounty} onValueChange={handleCountyChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={getCurrentCountyName()} />
      </SelectTrigger>
      <SelectContent>
        {counties.map((county) => (
          <SelectItem key={county.id} value={county.id}>
            {county.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};