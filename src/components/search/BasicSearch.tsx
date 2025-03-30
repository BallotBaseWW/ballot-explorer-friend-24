
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SearchFormValues } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

interface BasicSearchProps {
  form: UseFormReturn<SearchFormValues>;
}

export const BasicSearch = ({ form }: BasicSearchProps) => {
  const isMobile = useIsMobile();
  
  return (
    <FormField
      control={form.control}
      name="basicSearch"
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormControl>
            <Input
              placeholder={isMobile ? "Enter name to search" : "Search by last name or full name (e.g. 'Smith' or 'John Smith')"}
              {...field}
              className={isMobile ? "h-10 text-base" : "h-12"}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
