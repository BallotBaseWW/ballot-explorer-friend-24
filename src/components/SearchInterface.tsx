import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { ChevronDown, ChevronUp, Search as SearchIcon } from "lucide-react";

type SearchFormValues = {
  basicSearch: string;
  last_name: string;
  first_name: string;
  middle: string;
  suffix: string;
  house: string;
  street_name: string;
  unit_no: string;
  zip_code: string;
  date_of_birth: string;
  gender: string;
  enrolled_party: string;
  voter_status: string;
};

export const SearchInterface = ({ county }: { county: string }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const form = useForm<SearchFormValues>({
    defaultValues: {
      basicSearch: "",
      last_name: "",
      first_name: "",
      middle: "",
      suffix: "",
      house: "",
      street_name: "",
      unit_no: "",
      zip_code: "",
      date_of_birth: "",
      gender: "",
      enrolled_party: "",
      voter_status: "",
    },
  });

  const onSubmit = async (data: SearchFormValues) => {
    console.log("Search data:", data);
    // We'll implement the actual search functionality next
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Search */}
          <div className="flex gap-4">
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
            <Button type="submit" className="h-12 px-6">
              <SearchIcon className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          {/* Advanced Search */}
          <Collapsible
            open={isAdvancedOpen}
            onOpenChange={setIsAdvancedOpen}
            className="w-full space-y-4"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-center"
              >
                Advanced Search{" "}
                {isAdvancedOpen ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
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
                <FormField
                  control={form.control}
                  name="suffix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suffix</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
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
                  name="unit_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Number</FormLabel>
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
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enrolled_party"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Party</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="voter_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voter Status</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </form>
      </Form>
    </div>
  );
};