import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SearchFormValues } from "./types";

interface AdvancedSearchProps {
  form: UseFormReturn<SearchFormValues>;
}

export const AdvancedSearch = ({ form }: AdvancedSearchProps) => {
  const formFields = [
    { name: "last_name", label: "Last Name" },
    { name: "first_name", label: "First Name" },
    { name: "middle", label: "Middle Name" },
    { name: "suffix", label: "Suffix" },
    { name: "house", label: "House Number" },
    { name: "house_suffix", label: "House Suffix" },
    { name: "pre_st_direction", label: "Pre Street Direction" },
    { name: "street_name", label: "Street Name" },
    { name: "post_st_direction", label: "Post Street Direction" },
    { name: "aptunit_type", label: "Apt/Unit Type" },
    { name: "unit_no", label: "Unit Number" },
    { name: "res_add_not_stated", label: "Residence Address Not Stated" },
    { name: "residence_city", label: "Residence City" },
    { name: "zip_code", label: "ZIP Code" },
    { name: "zip_four", label: "ZIP+4" },
    { name: "mailing_address_one", label: "Mailing Address 1" },
    { name: "mailing_address_two", label: "Mailing Address 2" },
    { name: "mailing_address_three", label: "Mailing Address 3" },
    { name: "mailing_address_four", label: "Mailing Address 4" },
    { name: "date_of_birth", label: "Date of Birth", type: "date" },
    { name: "gender", label: "Gender" },
    { name: "enrolled_party", label: "Enrolled Party" },
    { name: "other_party", label: "Other Party" },
    { name: "county_code", label: "County Code" },
    { name: "election_district", label: "Election District" },
    { name: "legislative_district", label: "Legislative District" },
    { name: "town_city", label: "Town/City" },
    { name: "ward", label: "Ward" },
    { name: "congressional_district", label: "Congressional District" },
    { name: "state_senate_district", label: "State Senate District" },
    { name: "assembly_district", label: "Assembly District" },
    { name: "last_date_voted", label: "Last Date Voted" },
    { name: "last_year_voted", label: "Last Year Voted" },
    { name: "last_county_voted", label: "Last County Voted" },
    { name: "last_registered_address", label: "Last Registered Address" },
    { name: "last_registered_name", label: "Last Registered Name" },
    { name: "county_voter_no", label: "County Voter Number" },
    { name: "application_date", label: "Application Date", type: "date" },
    { name: "application_source", label: "Application Source" },
    { name: "id_required", label: "ID Required" },
    { name: "id_met_flag", label: "ID Met Flag" },
    { name: "voter_status", label: "Voter Status" },
    { name: "reason", label: "Reason" },
    { name: "inactive_date", label: "Inactive Date", type: "date" },
    { name: "purge_date", label: "Purge Date", type: "date" },
    { name: "state_voter_id", label: "State Voter ID" },
    { name: "voter_history", label: "Voter History" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {formFields.map((field) => (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name as keyof SearchFormValues}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel className="capitalize text-sm font-medium text-gray-700">
                {field.label}
              </FormLabel>
              <FormControl>
                <Input {...formField} type={field.type || "text"} />
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};