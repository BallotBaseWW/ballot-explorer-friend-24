import { Database } from "@/integrations/supabase/types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

export const AddressSection = ({ voter }: { voter: VoterRecord }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium mb-2">Address Details</h4>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Residence Address</h4>
          <p className="text-sm text-gray-600">
            {voter.house} {voter.house_suffix} {voter.pre_st_direction}{" "}
            {voter.street_name} {voter.post_st_direction}
            {voter.aptunit_type && `, ${voter.aptunit_type}`}
            {voter.unit_no && ` ${voter.unit_no}`}
          </p>
          <p className="text-sm text-gray-600">
            {voter.residence_city}, {voter.zip_code}
            {voter.zip_four && `-${voter.zip_four}`}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Mailing Address</h4>
          {voter.mailing_address_one && (
            <p className="text-sm text-gray-600">{voter.mailing_address_one}</p>
          )}
          {voter.mailing_address_two && (
            <p className="text-sm text-gray-600">{voter.mailing_address_two}</p>
          )}
          {voter.mailing_address_three && (
            <p className="text-sm text-gray-600">{voter.mailing_address_three}</p>
          )}
          {voter.mailing_address_four && (
            <p className="text-sm text-gray-600">{voter.mailing_address_four}</p>
          )}
        </div>
      </div>
    </div>
  );
};