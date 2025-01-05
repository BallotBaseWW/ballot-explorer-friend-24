import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";

interface AdvancedSearchProps {
  onSearch: (filters: Record<string, string>) => void;
}

export const AdvancedSearch = ({ onSearch }: AdvancedSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  return (
    <div className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-center w-full gap-2 text-sm text-gray-500 hover:text-gray-700 py-2">
          Advanced Search {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4 animate-fade-in bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                onChange={(e) => handleInputChange("first_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Enter city"
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                placeholder="Enter ZIP code"
                onChange={(e) => handleInputChange("zip_code", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registeredParty">Registered Party</Label>
              <Input
                id="registeredParty"
                placeholder="Enter registered party"
                onChange={(e) => handleInputChange("registered_party", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assemblyDistrict">Assembly District</Label>
              <Input
                id="assemblyDistrict"
                placeholder="Enter assembly district"
                onChange={(e) => handleInputChange("assembly_district", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="congressionalDistrict">Congressional District</Label>
              <Input
                id="congressionalDistrict"
                placeholder="Enter congressional district"
                onChange={(e) => handleInputChange("congressional_district", e.target.value)}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};