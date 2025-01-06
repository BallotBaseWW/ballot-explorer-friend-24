import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { County } from "@/components/search/list-utils/types";
import { CountySelector } from "./voter-search/CountySelector";
import { VoterSearchForm } from "./voter-search/VoterSearchForm";
import { VoterSearchResults } from "./voter-search/VoterSearchResults";
import { InteractionForm } from "./interaction-form/InteractionForm";
import { useInteractionMutation } from "./hooks/useInteractionMutation";
import { VoterInfo, InteractionType } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateInteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

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
  const [activeTab, setActiveTab] = useState("search");

  const createInteractionMutation = useInteractionMutation(() => {
    onSuccess();
    resetForm();
  });

  const searchVoter = async () => {
    if (!selectedCounty || !searchQuery) return;
    
    setIsSearching(true);
    try {
      const query = supabase
        .from(selectedCounty)
        .select('state_voter_id, first_name, last_name, date_of_birth');
      
      if (searchQuery.match(/^NY\d+$/)) {
        query.eq('state_voter_id', searchQuery);
      } else {
        const terms = searchQuery.trim().split(/\s+/);
        if (terms.length > 1) {
          const firstName = terms[0];
          const lastName = terms[terms.length - 1];
          query
            .ilike('first_name', `${firstName}%`)
            .ilike('last_name', `${lastName}%`);
        } else {
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
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error searching for voter",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoterSelect = (voter: VoterInfo) => {
    setSelectedVoter(voter);
    setActiveTab("create");
  };

  const handleCreateInteraction = async () => {
    console.log('Session state:', session);
    console.log('Selected voter state:', selectedVoter);
    console.log('Type state:', type);
    console.log('Notes state:', notes);

    if (!session?.user?.id) {
      console.error('No user ID found in session');
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create interactions.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVoter) {
      console.error('No voter selected');
      toast({
        title: "Validation Error",
        description: "Please select a voter before creating an interaction.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating interaction with data:', {
        userId: session.user.id,
        selectedVoter,
        type,
        notes
      });

      createInteractionMutation.mutate({
        userId: session.user.id,
        selectedVoter,
        type,
        notes,
      });
    } catch (error) {
      console.error('Error in handleCreateInteraction:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the interaction.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedCounty(null);
    setSearchQuery("");
    setSelectedVoter(null);
    setSearchResults([]);
    setType("call");
    setNotes("");
    setActiveTab("search");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Record New Interaction</DialogTitle>
          <DialogDescription>
            Search for a voter and record your interaction with them.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  onVoterSelect={handleVoterSelect}
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
                onSubmit={handleCreateInteraction}
                onBack={() => {
                  setSelectedVoter(null);
                  setActiveTab("search");
                }}
                isSubmitting={createInteractionMutation.isPending}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};