
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VoterCard } from "@/components/search/voter-card/VoterCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import { County } from "@/components/search/types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

const ListDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: listDetails } = useQuery({
    queryKey: ['voter-list', id],
    queryFn: async () => {
      const { data: list, error: listError } = await supabase
        .from('voter_lists')
        .select('*')
        .eq('id', id)
        .single();

      if (listError) throw listError;
      return list;
    },
  });

  const { data: voterItems, isLoading } = useQuery({
    queryKey: ['voter-list-items', id],
    queryFn: async () => {
      const { data: items, error: itemsError } = await supabase
        .from('voter_list_items')
        .select('*')
        .eq('list_id', id);

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
    enabled: !!id,
  });

  return (
    <div className="w-full p-4">
      <div className="mb-6">
        <Link to="/voter-lists">
          <Button 
            variant="outline" 
            className="mb-4"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lists
          </Button>
        </Link>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">{listDetails?.name}</h2>
        {listDetails?.description && (
          <p className="text-muted-foreground mt-2 text-sm md:text-base">{listDetails.description}</p>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="space-y-4">
        {voterItems?.map((voter: VoterRecord & { county: County }) => (
          <VoterCard
            key={voter.state_voter_id}
            voter={voter}
            county={voter.county}
            onPrint={() => {}}
          />
        ))}

        {!isLoading && voterItems?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No voters in this list yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ListDetails;
