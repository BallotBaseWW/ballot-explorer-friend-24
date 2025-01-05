import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, FileDown } from "lucide-react";
import { VoterList, VoterListItem } from "@/types/voter-list";
import { Database } from "@/integrations/supabase/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { formatDate, calculateAge } from "@/lib/utils";
import { PersonalSection } from "@/components/search/voter-sections/PersonalSection";
import { AddressSection } from "@/components/search/voter-sections/AddressSection";
import { DistrictSection } from "@/components/search/voter-sections/DistrictSection";
import { VotingSection } from "@/components/search/voter-sections/VotingSection";
import { RegistrationSection } from "@/components/search/voter-sections/RegistrationSection";
import { ExportDialog } from "@/components/export/ExportDialog";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

const getPartyColor = (party: string | null) => {
  const colors: { [key: string]: string } = {
    REP: "bg-red-500",
    DEM: "bg-blue-500",
    CON: "bg-yellow-500",
    WOR: "bg-purple-500",
    BLK: "bg-gray-700",
    OTH: "bg-black",
  };
  return colors[party || "OTH"] || colors["OTH"];
};

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
            .from(item.county.toLowerCase() as "bronx" | "brooklyn" | "manhattan" | "queens" | "statenisland")
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{list.name}</h1>
              {list.description && (
                <p className="text-gray-600 mt-2">{list.description}</p>
              )}
            </div>
            <ExportDialog voters={voters} listName={list.name} />
          </div>
        </div>

        <div className="space-y-4">
          {voters.map((voter) => (
            <div
              key={voter.state_voter_id}
              className="border rounded-lg bg-white shadow-sm overflow-hidden"
            >
              <Accordion type="single" collapsible>
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="hover:no-underline w-full px-4 py-4 [&[data-state=open]>div>div>.chevron]:rotate-90">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <h3 className="font-medium text-left">
                          {voter.first_name} {voter.middle} {voter.last_name}{" "}
                          {voter.suffix} {voter.date_of_birth && <span className="font-bold">({calculateAge(voter.date_of_birth)})</span>}
                        </h3>
                        <p className="text-sm text-gray-600 text-left">
                          {voter.house} {voter.street_name}, {voter.residence_city},{" "}
                          {voter.zip_code}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">Party:</span>
                          <Badge
                            className={`${getPartyColor(
                              voter.enrolled_party
                            )} text-white`}
                          >
                            {voter.enrolled_party || "OTH"}
                          </Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeVoter(voter.state_voter_id);
                            }}
                            className="ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-sm">View Details</span>
                        <ChevronRight className="h-5 w-5 chevron transition-transform duration-200" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-8 bg-gray-50 border-t">
                    <PersonalSection voter={voter} />
                    <AddressSection voter={voter} />
                    <DistrictSection voter={voter} />
                    <VotingSection voter={voter} />
                    <RegistrationSection voter={voter} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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