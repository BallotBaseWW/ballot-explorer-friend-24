import { Database } from "@/integrations/supabase/types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

export const RegistrationSection = ({ voter }: { voter: VoterRecord }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium mb-2">Registration Details</h4>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Application Date</label>
          <p className="text-sm text-gray-600">{voter.application_date}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Application Source</label>
          <p className="text-sm text-gray-600">{voter.application_source}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Previous Registration</label>
          <p className="text-sm text-gray-600">
            {voter.last_registered_name && (
              <span className="block">Name: {voter.last_registered_name}</span>
            )}
            {voter.last_registered_address && (
              <span className="block">
                Address: {voter.last_registered_address}
              </span>
            )}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">ID Information</label>
          <p className="text-sm text-gray-600">
            {voter.id_required && (
              <span className="block">Required: {voter.id_required}</span>
            )}
            {voter.id_met_flag && (
              <span className="block">Met: {voter.id_met_flag}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};