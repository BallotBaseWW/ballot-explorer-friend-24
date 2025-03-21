import { UseFormReturn } from "react-hook-form";

export type County = "bronx" | "brooklyn" | "manhattan" | "queens" | "statenisland";

export interface SearchFormValues {
  basicSearch: string;
  minAge: string;
  maxAge: string;
  last_name: string;
  first_name: string;
  middle: string;
  suffix: string;
  house: string;
  house_suffix: string;
  pre_st_direction: string;
  street_name: string;
  post_st_direction: string;
  aptunit_type: string;
  unit_no: string;
  res_add_not_stated: string;
  residence_city: string;
  zip_code: string;
  zip_four: string;
  mailing_address_one: string;
  mailing_address_two: string;
  mailing_address_three: string;
  mailing_address_four: string;
  date_of_birth: string;
  gender: string;
  enrolled_party: string;
  other_party: string;
  county_code: string;
  election_district: string;
  legislative_district: string;
  town_city: string;
  ward: string;
  congressional_district: string;
  state_senate_district: string;
  assembly_district: string;
  last_date_voted: string;
  last_year_voted: string;
  last_county_voted: string;
  last_registered_address: string;
  last_registered_name: string;
  county_voter_no: string;
  application_date: string;
  application_source: string;
  id_required: string;
  id_met_flag: string;
  voter_status: string;
  reason: string;
  inactive_date: string;
  purge_date: string;
  state_voter_id: string;
  voter_history: string;
}

export interface SearchFormProps {
  form: UseFormReturn<SearchFormValues>;
}