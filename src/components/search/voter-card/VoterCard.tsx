import { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddToListDialog } from "../AddToListDialog";
import { TagManager } from "./TagManager";
import { Printer } from "lucide-react";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

interface VoterCardProps {
  voter: VoterRecord;
  county: string;
  onPrint: (voter: VoterRecord) => void;
}

export const VoterCard = ({ voter, county, onPrint }: VoterCardProps) => {
  return (
    <div className="border rounded-lg bg-white shadow-sm p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-medium">
            {voter.first_name} {voter.middle} {voter.last_name} {voter.suffix}
          </h3>
          <p className="text-sm text-gray-600">
            {voter.house} {voter.street_name}, {voter.residence_city},{" "}
            {voter.zip_code}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600">Party:</span>
            <Badge>{voter.enrolled_party || "None"}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <TagManager 
            stateVoterId={voter.state_voter_id} 
            county={county} 
          />
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
        </div>
      </div>
    </div>
  );
};