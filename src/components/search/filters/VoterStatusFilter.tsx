import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { SearchFormValues } from "../types";

interface VoterStatusFilterProps {
  form: UseFormReturn<SearchFormValues>;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "A", label: "Active" },
  { value: "I", label: "Inactive" },
  { value: "P", label: "Purged" },
];

export const VoterStatusFilter = ({ form }: VoterStatusFilterProps) => {
  return (
    <FormField
      control={form.control}
      name="voter_status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Voter Status</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value || "all"}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
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