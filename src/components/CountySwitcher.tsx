
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
  currentCounty?: County;
  county?: County;
  setCounty?: (county: County) => void;
}

export const CountySwitcher = ({ currentCounty, county, setCounty }: CountySwitcherProps) => {
  const navigate = useNavigate();
  
  const activeCounty = county || currentCounty;

  const handleCountyChange = (value: string) => {
    // If used as a controlled component with setCounty prop
    if (setCounty) {
      setCounty(value as County);
    } 
    // If used for navigation
    else {
      navigate(`/search/${value}`);
    }
  };

  const getCurrentCountyName = () => {
    const county = counties.find(c => c.id === activeCounty);
    return county ? county.name : '';
  };

  return (
    <Select defaultValue={activeCounty} onValueChange={handleCountyChange}>
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
