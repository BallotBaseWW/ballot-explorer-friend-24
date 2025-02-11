
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VoterCard } from "../search/voter-card/VoterCard";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { County } from "../search/types";
import { Loader2, ListPlus, CheckCircle2 } from "lucide-react";
import { Badge } from "../ui/badge";

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

      // Get all voters with their survey status
      const { data: items, error: itemsError } = await supabase
        .from('voter_list_items')
        .select(`
          state_voter_id,
          county,
          survey_status
        `)
        .eq('list_id', listId);

      if (itemsError) {
        console.error("Error getting items:", itemsError);
        throw itemsError;
      }

      console.log("Voters found:", items?.length);

      if (!items || items.length === 0) {
        throw new Error('No voters found in this list.');
      }

      // Fetch voter details for each voter
      const voterPromises = items.map(async (item) => {
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

        // Get survey responses for this voter
        const { data: responses } = await supabase
          .from('survey_responses')
          .select('*')
          .eq('state_voter_id', item.state_voter_id)
          .eq('county', item.county);

        const hasCompletedSurvey = responses && responses.length > 0;

        return { 
          ...voter, 
          county: item.county as County,
          survey_status: hasCompletedSurvey ? 'completed' : 'pending'
        };
      });

      try {
        const voters = await Promise.all(voterPromises);
        const filteredVoters = voters.filter(voter => voter !== null);
        console.log("Successfully fetched voters:", filteredVoters.length);
        
        // Sort voters to show pending first
        return filteredVoters.sort((a, b) => {
          if (a.survey_status === 'pending' && b.survey_status === 'completed') return -1;
          if (a.survey_status === 'completed' && b.survey_status === 'pending') return 1;
          return 0;
        });
      } catch (error) {
        console.error("Error processing voters:", error);
        throw error;
      }
    },
    gcTime: 0,
    staleTime: 0,
    refetchInterval: 1000,
    refetchOnWindowFocus: true
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
          No voters found in this list.
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
          <div className="absolute top-4 right-20 flex items-center gap-2">
            {voter.survey_status === 'completed' ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </Badge>
            ) : (
              <Button 
                onClick={() => onVoterSelect(voter, voter.county)}
                className="gap-2"
              >
                <ListPlus className="h-4 w-4" />
                Survey this Voter
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
