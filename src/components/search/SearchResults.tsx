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
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Printer } from "lucide-react";
import { formatDate, calculateAge } from "@/lib/utils";
import { AddToListDialog } from "./AddToListDialog";
import { Button } from "@/components/ui/button";
import { printVoterRecord } from "./voter-sections/printUtils";
import { useToast } from "@/hooks/use-toast";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

interface SearchResultsProps {
  results: VoterRecord[];
  county: string;
}

const getPartyColor = (party: string | null) => {
  const colors: { [key: string]: string } = {
    REP: "bg-red-500",
    DEM: "bg-blue-500",
    CON: "bg-yellow-500",
    WOR: "bg-purple-500",
    BLK: "bg-gray-700",
    OTH: "bg-black",
  };
  return colors[party || "OTH"] || colors["OTH"];
};

export const SearchResults = ({ results, county }: SearchResultsProps) => {
  const { toast } = useToast();
  
  if (results.length === 0) return null;

  const handlePrint = async (voter: VoterRecord) => {
    try {
      await printVoterRecord(voter);
      toast({
        title: "Success",
        description: "PDF generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Search Results</h2>
      <div className="space-y-4">
        {results.map((voter, index) => {
          const age = voter.date_of_birth ? calculateAge(voter.date_of_birth) : null;
          return (
            <div
              key={index}
              className="border rounded-lg bg-white shadow-sm overflow-hidden"
            >
              <Accordion type="single" collapsible>
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="hover:no-underline w-full px-4 py-4 [&[data-state=open]>div>div>.chevron]:rotate-90">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <h3 className="font-medium text-left">
                          {voter.first_name} {voter.middle} {voter.last_name}{" "}
                          {voter.suffix} {age && <span className="font-bold">({age})</span>}
                        </h3>
                        <p className="text-sm text-gray-600 text-left">
                          {voter.house} {voter.street_name}, {voter.residence_city},{" "}
                          {voter.zip_code}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">Party:</span>
                          <Badge
                            className={`${getPartyColor(
                              voter.enrolled_party
                            )} text-white`}
                          >
                            {voter.enrolled_party || "OTH"}
                          </Badge>
                          <AddToListDialog 
                            stateVoterId={voter.state_voter_id}
                            county={county}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrint(voter);
                            }}
                            className="ml-2"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print Record
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-sm">View Details</span>
                        <ChevronRight className="h-5 w-5 chevron transition-transform duration-200" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-8 bg-gray-50 border-t">
                    <PersonalSection voter={voter} />
                    <AddressSection voter={voter} />
                    <DistrictSection voter={voter} />
                    <VotingSection voter={voter} />
                    <RegistrationSection voter={voter} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          );
        })}
      </div>
    </div>
  );
};