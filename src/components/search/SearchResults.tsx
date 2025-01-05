import { Database } from "@/integrations/supabase/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

interface SearchResultsProps {
  results: VoterRecord[];
}

export const SearchResults = ({ results }: SearchResultsProps) => {
  if (results.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Search Results</h2>
      <div className="space-y-4">
        {results.map((voter, index) => (
          <div
            key={index}
            className="border rounded-lg bg-white shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <h3 className="font-medium">
                {voter.first_name} {voter.middle} {voter.last_name}{" "}
                {voter.suffix}
              </h3>
              <p className="text-sm text-gray-600">
                {voter.house} {voter.street_name}, {voter.residence_city},{" "}
                {voter.zip_code}
              </p>
              <p className="text-sm text-gray-600">
                Party: {voter.enrolled_party}
              </p>
            </div>

            <Accordion type="single" collapsible className="border-t">
              <AccordionItem value="personal">
                <AccordionTrigger className="px-4">
                  Personal Information
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Date of Birth</label>
                    <p className="text-sm text-gray-600">{voter.date_of_birth}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Gender</label>
                    <p className="text-sm text-gray-600">{voter.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Voter Status</label>
                    <p className="text-sm text-gray-600">{voter.voter_status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">County Voter No.</label>
                    <p className="text-sm text-gray-600">{voter.county_voter_no}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="address">
                <AccordionTrigger className="px-4">
                  Address Details
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Residence Address</h4>
                      <p className="text-sm text-gray-600">
                        {voter.house} {voter.house_suffix} {voter.pre_st_direction}{" "}
                        {voter.street_name} {voter.post_st_direction}
                        {voter.aptunit_type && `, ${voter.aptunit_type}`}
                        {voter.unit_no && ` ${voter.unit_no}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {voter.residence_city}, {voter.zip_code}
                        {voter.zip_four && `-${voter.zip_four}`}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Mailing Address</h4>
                      {voter.mailing_address_one && (
                        <p className="text-sm text-gray-600">
                          {voter.mailing_address_one}
                        </p>
                      )}
                      {voter.mailing_address_two && (
                        <p className="text-sm text-gray-600">
                          {voter.mailing_address_two}
                        </p>
                      )}
                      {voter.mailing_address_three && (
                        <p className="text-sm text-gray-600">
                          {voter.mailing_address_three}
                        </p>
                      )}
                      {voter.mailing_address_four && (
                        <p className="text-sm text-gray-600">
                          {voter.mailing_address_four}
                        </p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="districts">
                <AccordionTrigger className="px-4">
                  District Information
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Election District</label>
                    <p className="text-sm text-gray-600">{voter.election_district}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Legislative District</label>
                    <p className="text-sm text-gray-600">{voter.legislative_district}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Congressional District</label>
                    <p className="text-sm text-gray-600">{voter.congressional_district}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Senate District</label>
                    <p className="text-sm text-gray-600">{voter.state_senate_district}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assembly District</label>
                    <p className="text-sm text-gray-600">{voter.assembly_district}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ward</label>
                    <p className="text-sm text-gray-600">{voter.ward}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="voting">
                <AccordionTrigger className="px-4">
                  Voting History
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Last Date Voted</label>
                    <p className="text-sm text-gray-600">{voter.last_date_voted}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Year Voted</label>
                    <p className="text-sm text-gray-600">{voter.last_year_voted}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last County Voted</label>
                    <p className="text-sm text-gray-600">{voter.last_county_voted}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Voter History</label>
                    <p className="text-sm text-gray-600">{voter.voter_history}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="registration">
                <AccordionTrigger className="px-4">
                  Registration Details
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Application Date</label>
                    <p className="text-sm text-gray-600">{voter.application_date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Application Source</label>
                    <p className="text-sm text-gray-600">{voter.application_source}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Previous Registration</label>
                    <p className="text-sm text-gray-600">
                      {voter.last_registered_name && (
                        <span className="block">
                          Name: {voter.last_registered_name}
                        </span>
                      )}
                      {voter.last_registered_address && (
                        <span className="block">
                          Address: {voter.last_registered_address}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">ID Information</label>
                    <p className="text-sm text-gray-600">
                      {voter.id_required && (
                        <span className="block">Required: {voter.id_required}</span>
                      )}
                      {voter.id_met_flag && (
                        <span className="block">Met: {voter.id_met_flag}</span>
                      )}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};