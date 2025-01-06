import { Card } from "@/components/ui/card";
import { County } from "@/components/search/list-utils/types";

interface VoterInfo {
  state_voter_id: string;
  first_name: string;
  last_name: string;
  county: County;
}

interface VoterSearchResultsProps {
  results: VoterInfo[];
  onVoterSelect: (voter: VoterInfo) => void;
}

export const VoterSearchResults = ({ results, onVoterSelect }: VoterSearchResultsProps) => {
  return (
    <div className="space-y-2">
      {results.map((voter) => (
        <Card
          key={`${voter.county}-${voter.state_voter_id}`}
          className="p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => onVoterSelect(voter)}
        >
          <p className="font-medium">
            {voter.first_name} {voter.last_name}
          </p>
          <p className="text-sm text-muted-foreground">
            ID: {voter.state_voter_id} | County: {voter.county}
          </p>
        </Card>
      ))}
    </div>
  );
};