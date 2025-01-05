import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2 } from "lucide-react";
import { VoterList, VoterListItem } from "@/types/voter-list";
import { Database } from "@/integrations/supabase/types";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

const ListDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [list, setList] = useState<VoterList | null>(null);
  const [voters, setVoters] = useState<Array<VoterRecord & { county: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListDetails();
  }, [id]);

  const fetchListDetails = async () => {
    if (!id) return;

    try {
      // Fetch list details
      const { data: listData, error: listError } = await supabase
        .from("voter_lists")
        .select("*")
        .eq("id", id)
        .single();

      if (listError) throw listError;
      setList(listData);

      // Fetch list items with voter details
      const { data: items, error: itemsError } = await supabase
        .from("voter_list_items")
        .select("*")
        .eq("list_id", id);

      if (itemsError) throw itemsError;

      // Fetch voter details for each item
      const voterDetails = await Promise.all(
        (items || []).map(async (item) => {
          const { data, error } = await supabase
            .from(item.county.toLowerCase())
            .select("*")
            .eq("state_voter_id", item.state_voter_id)
            .single();

          if (error) {
            console.error("Error fetching voter:", error);
            return null;
          }

          return { ...data, county: item.county };
        })
      );

      setVoters(voterDetails.filter((v): v is VoterRecord & { county: string } => v !== null));
    } catch (error) {
      console.error("Error fetching list details:", error);
      toast({
        title: "Error",
        description: "Failed to load list details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeVoter = async (stateVoterId: string) => {
    try {
      const { error } = await supabase
        .from("voter_list_items")
        .delete()
        .match({ list_id: id, state_voter_id: stateVoterId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voter removed from list",
      });

      fetchListDetails();
    } catch (error) {
      console.error("Error removing voter:", error);
      toast({
        title: "Error",
        description: "Failed to remove voter",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto p-4">
          <div className="text-center py-12">
            <p className="text-gray-500">List not found.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/lists")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lists
          </Button>
          <h1 className="text-2xl font-bold">{list.name}</h1>
          {list.description && (
            <p className="text-gray-600 mt-2">{list.description}</p>
          )}
        </div>

        <div className="space-y-4">
          {voters.map((voter) => (
            <div
              key={voter.state_voter_id}
              className="flex justify-between items-center p-4 bg-white border rounded-lg shadow-sm"
            >
              <div>
                <h3 className="font-medium">
                  {voter.first_name} {voter.middle} {voter.last_name} {voter.suffix}
                </h3>
                <p className="text-sm text-gray-600">
                  {voter.house} {voter.street_name}, {voter.residence_city},{" "}
                  {voter.zip_code}
                </p>
                <p className="text-sm text-gray-500">County: {voter.county}</p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeVoter(voter.state_voter_id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {voters.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No voters in this list yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListDetail;