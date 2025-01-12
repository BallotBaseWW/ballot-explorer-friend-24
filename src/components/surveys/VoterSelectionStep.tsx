import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VoterCard } from "../search/voter-card/VoterCard";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { County } from "../search/types";
import { Loader2, ListPlus } from "lucide-react";

interface VoterSelectionStepProps {
  listId: string;
  onVoterSelect: (voter: any, county: County) => void;
}

export const VoterSelectionStep = ({ listId, onVoterSelect }: VoterSelectionStepProps) => {
  const { data: voterItems, isLoading, error } = useQuery({
    queryKey: ['voter-list-items', listId],
    queryFn: async () => {
      if (!listId) {
        throw new Error('No list assigned to this survey. Please assign a list first.');
      }

      console.log("Fetching voters for list:", listId);

      // First verify the list exists
      const { data: list, error: listError } = await supabase
        .from('voter_lists')
        .select('*')
        .eq('id', listId)
        .maybeSingle();

      if (listError) {
        console.error("Error getting list:", listError);
        throw listError;
      }

      if (!list) {
        throw new Error('The assigned list could not be found.');
      }

      // Then get pending voters with strict status check
      const { data: items, error: itemsError } = await supabase
        .from('voter_list_items')
        .select('*')
        .eq('list_id', listId)
        .eq('survey_status', 'pending');

      if (itemsError) {
        console.error("Error getting items:", itemsError);
        throw itemsError;
      }

      console.log("Pending voters found:", items?.length);

      if (!items || items.length === 0) {
        throw new Error('All voters in this list have been surveyed.');
      }

      // Fetch voter details for each pending voter
      const voterPromises = items.map(async (item) => {
        // Double check the survey status before proceeding
        const { data: statusCheck } = await supabase
          .from('voter_list_items')
          .select('survey_status')
          .eq('list_id', listId)
          .eq('state_voter_id', item.state_voter_id)
          .single();

        if (statusCheck?.survey_status !== 'pending') {
          console.log(`Skipping voter ${item.state_voter_id} - status is ${statusCheck?.survey_status}`);
          return null;
        }

        if (!isValidCounty(item.county)) {
          console.error("Invalid county:", item.county);
          throw new Error(`Invalid county: ${item.county}`);
        }

        const { data: voter, error: voterError } = await supabase
          .from(item.county as County)
          .select('*')
          .eq('state_voter_id', item.state_voter_id)
          .maybeSingle();

        if (voterError) {
          console.error("Error getting voter:", voterError);
          throw voterError;
        }
        
        if (!voter) {
          console.error(`Voter not found in ${item.county} county`);
          return null;
        }

        return { ...voter, county: item.county as County };
      });

      try {
        const voters = await Promise.all(voterPromises);
        const filteredVoters = voters.filter(voter => voter !== null);
        console.log("Successfully fetched voters:", filteredVoters.length);
        return filteredVoters;
      } catch (error) {
        console.error("Error processing voters:", error);
        throw error;
      }
    },
    refetchInterval: 1000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0
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

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          {error instanceof Error ? error.message : 'An error occurred while loading voters.'}
        </p>
      </Card>
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
            hideAddToList
          />
          <div className="absolute top-4 right-4">
            <Button 
              onClick={() => onVoterSelect(voter, voter.county)}
              className="gap-2"
            >
              <ListPlus className="h-4 w-4" />
              Survey this Voter
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};