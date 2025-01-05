import { Database } from "@/integrations/supabase/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PersonalSection } from "./voter-sections/PersonalSection";
import { AddressSection } from "./voter-sections/AddressSection";
import { DistrictSection } from "./voter-sections/DistrictSection";
import { VotingSection } from "./voter-sections/VotingSection";
import { RegistrationSection } from "./voter-sections/RegistrationSection";

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
              <AccordionItem value="details">
                <AccordionTrigger className="px-4">
                  Voter Details
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-8">
                  <PersonalSection voter={voter} />
                  <AddressSection voter={voter} />
                  <DistrictSection voter={voter} />
                  <VotingSection voter={voter} />
                  <RegistrationSection voter={voter} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};