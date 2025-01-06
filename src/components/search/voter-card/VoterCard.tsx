import { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToListDialog } from "../AddToListDialog";
import { TagManager } from "./TagManager";
import { Printer, User, MapPin, Calendar, ChevronDown, Tag } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { County } from "../types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

interface VoterCardProps {
  voter: VoterRecord;
  county: County;
  onPrint: (voter: VoterRecord) => void;
}

export const VoterCard = ({ voter, county, onPrint }: VoterCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(
      parseInt(dateStr.substring(0, 4)), 
      parseInt(dateStr.substring(4, 6)) - 1, 
      parseInt(dateStr.substring(6, 8))
    ).toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">
                {voter.first_name} {voter.middle} {voter.last_name} {voter.suffix}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <p>
                {voter.house} {voter.house_suffix} {voter.pre_st_direction} {voter.street_name} {voter.post_st_direction}
                {voter.aptunit_type && `, ${voter.aptunit_type}`}
                {voter.unit_no && ` ${voter.unit_no}`}, {voter.residence_city},{" "}
                {voter.zip_code}
                {voter.zip_four && `-${voter.zip_four}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={voter.voter_status === "A" ? "default" : "secondary"}>
              {voter.voter_status === "A" ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">{voter.enrolled_party || "No Party"}</Badge>
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
          <div>
            <TagManager 
              stateVoterId={voter.state_voter_id} 
              county={county}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <AddToListDialog 
          stateVoterId={voter.state_voter_id}
          county={county}
        />
        <Button
          variant="outline"
          size="sm"
          className="md:w-auto w-full text-sm px-2 h-8 whitespace-nowrap"
        >
          <Tag className="h-4 w-4 mr-2" />
          Add Tags
        </Button>
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-2">
              View Details <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
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