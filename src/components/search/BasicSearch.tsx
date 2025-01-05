import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SearchFormValues } from "./types";

interface BasicSearchProps {
  form: UseFormReturn<SearchFormValues>;
}

export const BasicSearch = ({ form }: BasicSearchProps) => {
  return (
    <FormField
      control={form.control}
      name="basicSearch"
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormControl>
            <Input
              placeholder="Search by name..."
              {...field}
              className="h-12"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};