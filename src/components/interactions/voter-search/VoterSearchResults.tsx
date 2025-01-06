import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { County } from "@/components/search/list-utils/types";
import { UserPlus } from "lucide-react";
import { calculateAge } from "@/lib/utils";

interface VoterInfo {
  state_voter_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  county: County;
}

interface VoterSearchResultsProps {
  results: VoterInfo[];
  onVoterSelect: (voter: VoterInfo) => void;
}

export const VoterSearchResults = ({ results, onVoterSelect }: VoterSearchResultsProps) => {
  return (
    <div className="space-y-2">
      {results.map((voter) => {
        const age = voter.date_of_birth ? calculateAge(voter.date_of_birth) : null;
        
        return (
          <Card
            key={`${voter.county}-${voter.state_voter_id}`}
            className="p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {voter.first_name} {voter.last_name}
                  {age && <span className="text-muted-foreground ml-2">({age} years old)</span>}
                </p>
                <p className="text-sm text-muted-foreground">
                  ID: {voter.state_voter_id} | County: {voter.county}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onVoterSelect(voter)}
                className="ml-4"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Select Voter
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};