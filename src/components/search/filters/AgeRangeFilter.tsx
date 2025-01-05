import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SearchFormValues } from "../types";

interface AgeRangeFilterProps {
  form: UseFormReturn<SearchFormValues>;
}

export const AgeRangeFilter = ({ form }: AgeRangeFilterProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="minAge"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Age</FormLabel>
            <FormControl>
              <Input type="number" min="18" max="120" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="maxAge"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Age</FormLabel>
            <FormControl>
              <Input type="number" min="18" max="120" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};