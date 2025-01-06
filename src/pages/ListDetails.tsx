import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
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

  const { data: voterItems } = useQuery({
    queryKey: ['voter-list-items', id],
    queryFn: async () => {
      const { data: items, error: itemsError } = await supabase
        .from('voter_list_items')
        .select('*')
        .eq('list_id', id);

      if (itemsError) throw itemsError;

      // Fetch voter details for each item
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
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <Link to="/lists">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lists
            </Button>
          </Link>
          <h2 className="text-2xl font-semibold">{listDetails?.name}</h2>
          {listDetails?.description && (
            <p className="text-muted-foreground mt-2">{listDetails.description}</p>
          )}
        </div>

        <div className="space-y-4">
          {voterItems?.map((voter: VoterRecord & { county: County }) => (
            <VoterCard
              key={voter.state_voter_id}
              voter={voter}
              county={voter.county}
              onPrint={() => {}}
            />
          ))}

          {!voterItems?.length && (
            <div className="text-center py-8 text-muted-foreground">
              No voters in this list yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListDetails;