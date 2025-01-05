import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Form } from "@/components/ui/form";
import { ChevronDown, ChevronUp, Search as SearchIcon } from "lucide-react";
import { BasicSearch } from "./search/BasicSearch";
import { AdvancedSearch } from "./search/AdvancedSearch";
import { SearchFormValues } from "./search/types";
import { SearchResults } from "./search/SearchResults";
import { useState } from "react";
import { useSearch } from "./search/useSearch";

export const SearchInterface = ({ county }: { county: string }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const { searchResults, isLoading, performSearch } = useSearch(county);

  const form = useForm<SearchFormValues>({
    defaultValues: {
      basicSearch: "",
      last_name: "",
      first_name: "",
      middle: "",
      suffix: "",
      house: "",
      house_suffix: "",
      pre_st_direction: "",
      street_name: "",
      post_st_direction: "",
      aptunit_type: "",
      unit_no: "",
      res_add_not_stated: "",
      residence_city: "",
      zip_code: "",
      zip_four: "",
      mailing_address_one: "",
      mailing_address_two: "",
      mailing_address_three: "",
      mailing_address_four: "",
      date_of_birth: "",
      gender: "",
      enrolled_party: "",
      other_party: "",
      county_code: "",
      election_district: "",
      legislative_district: "",
      town_city: "",
      ward: "",
      congressional_district: "",
      state_senate_district: "",
      assembly_district: "",
      last_date_voted: "",
      last_year_voted: "",
      last_county_voted: "",
      last_registered_address: "",
      last_registered_name: "",
      county_voter_no: "",
      application_date: "",
      application_source: "",
      id_required: "",
      id_met_flag: "",
      voter_status: "",
      reason: "",
      inactive_date: "",
      purge_date: "",
      state_voter_id: "",
      voter_history: "",
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(performSearch)} className="space-y-6">
          <div className="flex gap-4">
            <BasicSearch form={form} />
            <Button type="submit" className="h-12 px-6" disabled={isLoading}>
              <SearchIcon className="mr-2 h-4 w-4" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>

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
              <AdvancedSearch form={form} />
            </CollapsibleContent>
          </Collapsible>
        </form>
      </Form>

      <SearchResults results={searchResults} />
    </div>
  );
};
