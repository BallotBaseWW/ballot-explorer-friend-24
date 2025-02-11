import { Database } from "@/integrations/supabase/types";
import { useState } from "react";
import { printVoterRecord } from "../voter-sections/printUtils";
import { Button } from "@/components/ui/button";
import { Printer, Calendar, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PartyBadge } from "./PartyBadge";
import { PersonalInfo } from "./PersonalInfo";
import { AddressInfo } from "./AddressInfo";
import { formatDate } from "@/lib/utils";
import { County } from "../types";
import { AddSingleVoterDialog } from "../voter-lists/AddSingleVoterDialog";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

interface VoterCardProps {
  voter: VoterRecord;
  county: County;
  onPrint: (voter: VoterRecord) => void;
  hideAddToList?: boolean;
}

export const VoterCard = ({ voter, county, onPrint, hideAddToList = false }: VoterCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <PersonalInfo
              firstName={voter.first_name}
              middleName={voter.middle}
              lastName={voter.last_name}
              suffix={voter.suffix}
              dateOfBirth={voter.date_of_birth}
            />
            <AddressInfo
              house={voter.house}
              houseSuffix={voter.house_suffix}
              preStDirection={voter.pre_st_direction}
              streetName={voter.street_name}
              postStDirection={voter.post_st_direction}
              aptunitType={voter.aptunit_type}
              unitNo={voter.unit_no}
              residenceCity={voter.residence_city}
              zipCode={voter.zip_code}
              zipFour={voter.zip_four}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!hideAddToList && (
              <AddSingleVoterDialog 
                voter={{ state_voter_id: voter.state_voter_id }} 
                county={county}
              />
            )}
            <PartyBadge party={voter.enrolled_party} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Registration Date:</span>
              {formatDate(voter.application_date)}
            </div>
            {voter.last_date_voted && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Last Voted:</span>
                {formatDate(voter.last_date_voted)}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-2">
              View Details <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Voter Status:</span>
                <p>{voter.voter_status === "A" ? "Active" : "Inactive"}</p>
              </div>
              <div>
                <span className="font-medium">Election District:</span>
                <p>{voter.election_district}</p>
              </div>
              <div>
                <span className="font-medium">Assembly District:</span>
                <p>{voter.assembly_district}</p>
              </div>
              <div>
                <span className="font-medium">Congressional District:</span>
                <p>{voter.congressional_district}</p>
              </div>
              <div>
                <span className="font-medium">Senate District:</span>
                <p>{voter.state_senate_district}</p>
              </div>
              <div>
                <span className="font-medium">Legislative District:</span>
                <p>{voter.legislative_district}</p>
              </div>
              <div>
                <span className="font-medium">Ward:</span>
                <p>{voter.ward}</p>
              </div>
              <div>
                <span className="font-medium">County Code:</span>
                <p>{voter.county_code}</p>
              </div>
              <div>
                <span className="font-medium">County Voter No:</span>
                <p>{voter.county_voter_no}</p>
              </div>
              <div>
                <span className="font-medium">State Voter ID:</span>
                <p>{voter.state_voter_id}</p>
              </div>
              <div>
                <span className="font-medium">Gender:</span>
                <p>{voter.gender}</p>
              </div>
              <div>
                <span className="font-medium">Date of Birth:</span>
                <p>{formatDate(voter.date_of_birth)}</p>
              </div>
              <div>
                <span className="font-medium">Application Source:</span>
                <p>{voter.application_source}</p>
              </div>
              <div>
                <span className="font-medium">ID Required:</span>
                <p>{voter.id_required}</p>
              </div>
              <div>
                <span className="font-medium">ID Met Flag:</span>
                <p>{voter.id_met_flag}</p>
              </div>
              {voter.inactive_date && (
                <div>
                  <span className="font-medium">Inactive Date:</span>
                  <p>{formatDate(voter.inactive_date)}</p>
                </div>
              )}
              {voter.purge_date && (
                <div>
                  <span className="font-medium">Purge Date:</span>
                  <p>{formatDate(voter.purge_date)}</p>
                </div>
              )}
              {voter.reason && (
                <div>
                  <span className="font-medium">Status Reason:</span>
                  <p>{voter.reason}</p>
                </div>
              )}
            </div>
            
            {(voter.mailing_address_one || voter.mailing_address_two || voter.mailing_address_three || voter.mailing_address_four) && (
              <div className="space-y-2">
                <span className="font-medium">Mailing Address:</span>
                {voter.mailing_address_one && <p>{voter.mailing_address_one}</p>}
                {voter.mailing_address_two && <p>{voter.mailing_address_two}</p>}
                {voter.mailing_address_three && <p>{voter.mailing_address_three}</p>}
                {voter.mailing_address_four && <p>{voter.mailing_address_four}</p>}
              </div>
            )}

            {voter.voter_history && (
              <div>
                <span className="font-medium">Voter History:</span>
                <p>{voter.voter_history}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrint(voter)}
                className="h-8"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Record
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  );
};
