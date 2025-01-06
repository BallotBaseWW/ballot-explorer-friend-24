import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { County } from "@/components/search/list-utils/types";
import { CountySelector } from "./voter-search/CountySelector";
import { VoterSearchForm } from "./voter-search/VoterSearchForm";
import { VoterSearchResults } from "./voter-search/VoterSearchResults";
import { InteractionForm } from "./interaction-form/InteractionForm";

interface VoterInfo {
  state_voter_id: string;
  first_name: string;
  last_name: string;
  county: County;
}

interface CreateInteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type InteractionType = "call" | "email" | "meeting" | "door_knock" | "other";

export const CreateInteractionDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateInteractionDialogProps) => {
  const session = useSession();
  const { toast } = useToast();
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVoter, setSelectedVoter] = useState<VoterInfo | null>(null);
  const [searchResults, setSearchResults] = useState<VoterInfo[]>([]);
  const [type, setType] = useState<InteractionType>("call");
  const [notes, setNotes] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchVoter = async () => {
    if (!selectedCounty || !searchQuery) return;
    
    setIsSearching(true);
    try {
      const query = supabase.from(selectedCounty).select('state_voter_id, first_name, last_name');
      
      // Check if the search query looks like a voter ID
      if (searchQuery.match(/^NY\d+$/)) {
        query.eq('state_voter_id', searchQuery);
      } else {
        // Split the search query into potential first and last names
        const terms = searchQuery.trim().split(/\s+/);
        if (terms.length > 1) {
          // If multiple terms, assume first and last name
          const firstName = terms[0];
          const lastName = terms[terms.length - 1];
          query
            .ilike('first_name', `${firstName}%`)
            .ilike('last_name', `${lastName}%`);
        } else {
          // If single term, search in last name only
          query.ilike('last_name', `${searchQuery}%`);
        }
      }

      const { data, error } = await query.limit(5);

      if (error) throw error;

      setSearchResults(
        data.map(voter => ({
          ...voter,
          county: selectedCounty
        }))
      );

      if (data.length === 0) {
        toast({
          title: "No voters found",
          description: "Try adjusting your search terms",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching voter:', error);
      toast({
        title: "Error searching voter",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const createInteractionMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !selectedVoter) throw new Error("Not authenticated or no voter selected");

      const { error } = await supabase.from("voter_interactions").insert({
        user_id: session.user.id,
        state_voter_id: selectedVoter.state_voter_id,
        county: selectedVoter.county.toUpperCase(),
        type,
        notes,
        interaction_date: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Interaction recorded successfully" });
      onSuccess();
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Error creating interaction:", error);
      toast({
        title: "Error creating interaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedCounty(null);
    setSearchQuery("");
    setSelectedVoter(null);
    setSearchResults([]);
    setType("call");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Record New Interaction</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" disabled={!!selectedVoter}>
              Find Voter
            </TabsTrigger>
            <TabsTrigger value="create" disabled={!selectedVoter}>
              Create Interaction
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="space-y-4">
              <CountySelector
                onCountySelect={setSelectedCounty}
                selectedCounty={selectedCounty}
              />

              <VoterSearchForm
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onSearch={searchVoter}
                isSearching={isSearching}
                selectedCounty={selectedCounty}
              />

              {searchResults.length > 0 && (
                <VoterSearchResults
                  results={searchResults}
                  onVoterSelect={setSelectedVoter}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="create">
            {selectedVoter && (
              <InteractionForm
                selectedVoter={selectedVoter}
                type={type}
                notes={notes}
                onTypeChange={setType}
                onNotesChange={setNotes}
                onSubmit={() => createInteractionMutation.mutate()}
                onBack={() => setSelectedVoter(null)}
                isSubmitting={createInteractionMutation.isPending}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};