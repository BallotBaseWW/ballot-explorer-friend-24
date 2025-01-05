import { Database } from "@/integrations/supabase/types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

export const PersonalSection = ({ voter }: { voter: VoterRecord }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium mb-2">Personal Information</h4>
      <div className="grid grid-cols-2 gap-4">
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
      </div>
    </div>
  );
};