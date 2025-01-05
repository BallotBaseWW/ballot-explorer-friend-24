import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { SearchFormValues } from "../types";

interface PartyFilterProps {
  form: UseFormReturn<SearchFormValues>;
}

const PARTY_OPTIONS = [
  { value: "", label: "All Parties" },
  { value: "DEM", label: "Democratic" },
  { value: "REP", label: "Republican" },
  { value: "CON", label: "Conservative" },
  { value: "WOR", label: "Working Families" },
  { value: "IND", label: "Independent" },
  { value: "BLK", label: "Blank (No Party)" },
];

export const PartyFilter = ({ form }: PartyFilterProps) => {
  return (
    <FormField
      control={form.control}
      name="enrolled_party"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Party</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a party" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {PARTY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};