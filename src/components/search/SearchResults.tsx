import { Database } from "@/integrations/supabase/types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

interface SearchResultsProps {
  results: VoterRecord[];
}

export const SearchResults = ({ results }: SearchResultsProps) => {
  if (results.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Search Results</h2>
      <div className="space-y-4">
        {results.map((voter, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg bg-white shadow-sm"
          >
            <h3 className="font-medium">
              {voter.first_name} {voter.middle} {voter.last_name}{" "}
              {voter.suffix}
            </h3>
            <p className="text-sm text-gray-600">
              {voter.house} {voter.street_name}, {voter.residence_city},{" "}
              {voter.zip_code}
            </p>
            <p className="text-sm text-gray-600">
              Party: {voter.enrolled_party}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};