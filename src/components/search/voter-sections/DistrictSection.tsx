import { Database } from "@/integrations/supabase/types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

export const DistrictSection = ({ voter }: { voter: VoterRecord }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium mb-2">District Information</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Election District</label>
          <p className="text-sm text-gray-600">{voter.election_district}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Legislative District</label>
          <p className="text-sm text-gray-600">{voter.legislative_district}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Congressional District</label>
          <p className="text-sm text-gray-600">{voter.congressional_district}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Senate District</label>
          <p className="text-sm text-gray-600">{voter.state_senate_district}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Assembly District</label>
          <p className="text-sm text-gray-600">{voter.assembly_district}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Ward</label>
          <p className="text-sm text-gray-600">{voter.ward}</p>
        </div>
      </div>
    </div>
  );
};