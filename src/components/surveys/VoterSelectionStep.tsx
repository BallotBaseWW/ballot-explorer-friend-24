import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VoterCard } from "../search/voter-card/VoterCard";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { County } from "../search/types";

interface VoterSelectionStepProps {
  listId: string;
  onVoterSelect: (voter: any, county: County) => void;
}

export const VoterSelectionStep = ({ listId, onVoterSelect }: VoterSelectionStepProps) => {
  const { data: voterItems, isLoading } = useQuery({
    queryKey: ['voter-list-items', listId],
    queryFn: async () => {
      const { data: items, error: itemsError } = await supabase
        .from('voter_list_items')
        .select('*')
        .eq('list_id', listId)
        .eq('survey_status', 'pending');

      if (itemsError) throw itemsError;

      const voterPromises = items.map(async (item) => {
        const { data: voter, error: voterError } = await supabase
          .from(item.county as County)
          .select('*')
          .eq('state_voter_id', item.state_voter_id)
          .single();

        if (voterError) throw voterError;
        return { ...voter, county: item.county };
      });

      return Promise.all(voterPromises);
    },
  });

  if (isLoading) {
    return <div>Loading voters...</div>;
  }

  if (!voterItems?.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No pending voters found in this list.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Select a Voter</h2>
      {voterItems.map((voter) => (
        <div key={voter.state_voter_id} className="relative">
          <VoterCard
            voter={voter}
            county={voter.county}
            onPrint={() => {}}
          />
          <div className="absolute top-4 right-4">
            <Button onClick={() => onVoterSelect(voter, voter.county)}>
              Survey this Voter
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};