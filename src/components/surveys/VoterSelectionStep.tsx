import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VoterCard } from "../search/voter-card/VoterCard";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { County } from "../search/types";
import { Loader2 } from "lucide-react";

interface VoterSelectionStepProps {
  listId: string;
  onVoterSelect: (voter: any, county: County) => void;
}

export const VoterSelectionStep = ({ listId, onVoterSelect }: VoterSelectionStepProps) => {
  const { data: voterItems, isLoading } = useQuery({
    queryKey: ['voter-list-items', listId],
    queryFn: async () => {
      // First get total count of voters in list
      const { count: totalCount, error: countError } = await supabase
        .from('voter_list_items')
        .select('*', { count: 'exact', head: true })
        .eq('list_id', listId);

      if (countError) throw countError;

      // Then get pending voters
      const { data: items, error: itemsError } = await supabase
        .from('voter_list_items')
        .select('*')
        .eq('list_id', listId)
        .eq('survey_status', 'pending');

      if (itemsError) throw itemsError;

      if (items.length === 0 && totalCount === 0) {
        throw new Error('No voters found in this list.');
      }

      if (items.length === 0 && totalCount > 0) {
        throw new Error('All voters in this list have been surveyed.');
      }

      const voterPromises = items.map(async (item) => {
        if (!isValidCounty(item.county)) {
          throw new Error(`Invalid county: ${item.county}`);
        }

        const { data: voter, error: voterError } = await supabase
          .from(item.county as County)
          .select('*')
          .eq('state_voter_id', item.state_voter_id)
          .single();

        if (voterError) throw voterError;
        return { ...voter, county: item.county as County };
      });

      return Promise.all(voterPromises);
    },
  });

  const isValidCounty = (county: string): county is County => {
    return ['bronx', 'brooklyn', 'manhattan', 'queens', 'statenisland'].includes(county);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!voterItems?.length) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No pending voters found in this list. This could mean either:
          <br />
          1. The list is empty
          <br />
          2. All voters in this list have already been surveyed
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