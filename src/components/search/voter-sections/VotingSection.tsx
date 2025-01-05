import { Database } from "@/integrations/supabase/types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

export const VotingSection = ({ voter }: { voter: VoterRecord }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium mb-2">Voting History</h4>
      <div className="space-y-4">
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
      </div>
    </div>
  );
};