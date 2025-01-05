import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SearchFormValues } from "./types";
import { AgeRangeFilter } from "./filters/AgeRangeFilter";
import { PartyFilter } from "./filters/PartyFilter";
import { DistrictFilter } from "./filters/DistrictFilter";
import { VoterStatusFilter } from "./filters/VoterStatusFilter";
import { Separator } from "@/components/ui/separator";

interface AdvancedSearchProps {
  form: UseFormReturn<SearchFormValues>;
}

export const AdvancedSearch = ({ form }: AdvancedSearchProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Demographics</h3>
        <AgeRangeFilter form={form} />
        <PartyFilter form={form} />
        <VoterStatusFilter form={form} />
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Districts</h3>
        <DistrictFilter form={form} />
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="middle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="house"
            render={({ field }) => (
              <FormItem>
                <FormLabel>House Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="street_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};