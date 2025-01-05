import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (field: string, value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label: string;
}

export const SearchBar = ({ onSearch, placeholder, disabled = false, label }: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch(label.toLowerCase().replace(' ', '_'), e.target.value)}
          className="w-full pl-12 pr-4 py-3 text-lg rounded-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={disabled}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    </div>
  );
};