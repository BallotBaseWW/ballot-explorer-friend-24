import { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToListDialog } from "../AddToListDialog";
import { TagManager } from "./TagManager";
import { Printer, User, MapPin, Calendar } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { County } from "../types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

interface VoterCardProps {
  voter: VoterRecord;
  county: County;
  onPrint: (voter: VoterRecord) => void;
}

export const VoterCard = ({ voter, county, onPrint }: VoterCardProps) => {
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
                {voter.house} {voter.street_name}
                {voter.unit_no && `, Unit ${voter.unit_no}`}, {voter.residence_city},{" "}
                {voter.zip_code}
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
          onClick={() => onPrint(voter)}
          className="h-8"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Record
        </Button>
      </CardFooter>
    </Card>
  );
};