import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SearchFormValues } from "../types";

interface DistrictFilterProps {
  form: UseFormReturn<SearchFormValues>;
}

export const DistrictFilter = ({ form }: DistrictFilterProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <FormField
        control={form.control}
        name="election_district"
        render={({ field: { onChange, ...field } }) => (
          <FormItem>
            <FormLabel>Election District</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type="text"
                pattern="[0-9]*"
                onChange={(e) => {
                  const value = e.target.value;
                  onChange(value ? value : "");
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="assembly_district"
        render={({ field: { onChange, ...field } }) => (
          <FormItem>
            <FormLabel>Assembly District</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type="text"
                pattern="[0-9]*"
                onChange={(e) => {
                  const value = e.target.value;
                  onChange(value ? value : "");
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="state_senate_district"
        render={({ field: { onChange, ...field } }) => (
          <FormItem>
            <FormLabel>Senate District</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type="text"
                pattern="[0-9]*"
                onChange={(e) => {
                  const value = e.target.value;
                  onChange(value ? value : "");
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="congressional_district"
        render={({ field: { onChange, ...field } }) => (
          <FormItem>
            <FormLabel>Congressional District</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type="text"
                pattern="[0-9]*"
                onChange={(e) => {
                  const value = e.target.value;
                  onChange(value ? value : "");
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};