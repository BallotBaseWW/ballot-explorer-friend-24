import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { County } from "@/components/search/list-utils/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

type InteractionType = "call" | "email" | "meeting" | "door_knock" | "other";

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

export const CreateInteractionDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateInteractionDialogProps) => {
  const session = useSession();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVoter, setSelectedVoter] = useState<VoterInfo | null>(null);
  const [searchResults, setSearchResults] = useState<VoterInfo[]>([]);
  const [type, setType] = useState<InteractionType>("call");
  const [notes, setNotes] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchVoter = async (query: string) => {
    setIsSearching(true);
    try {
      // Try to find by NYS Voter ID first
      const counties: County[] = ["bronx", "brooklyn", "manhattan", "queens", "statenisland"];
      let found = false;

      for (const county of counties) {
        const { data, error } = await supabase
          .from(county)
          .select('state_voter_id, first_name, last_name')
          .eq('state_voter_id', query)
          .single();

        if (data && !error) {
          setSearchResults([{ ...data, county }]);
          found = true;
          break;
        }
      }

      // If not found by ID, search by name
      if (!found) {
        const allResults = await Promise.all(
          counties.map(async (county) => {
            const { data, error } = await supabase
              .from(county)
              .select('state_voter_id, first_name, last_name')
              .ilike('last_name', `${query}%`)
              .limit(5);

            if (data && !error) {
              return data.map(voter => ({ ...voter, county }));
            }
            return [];
          })
        );

        setSearchResults(allResults.flat());
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
              <div className="flex gap-2">
                <Input
                  placeholder="Enter NYS Voter ID or last name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  onClick={() => searchVoter(searchQuery)}
                  disabled={!searchQuery || isSearching}
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>

              <div className="space-y-2">
                {searchResults.map((voter) => (
                  <Card
                    key={`${voter.county}-${voter.state_voter_id}`}
                    className="p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedVoter(voter)}
                  >
                    <p className="font-medium">
                      {voter.first_name} {voter.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ID: {voter.state_voter_id} | County: {voter.county}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create">
            {selectedVoter && (
              <div className="space-y-4">
                <Card className="p-4">
                  <p className="font-medium">
                    Selected Voter: {selectedVoter.first_name} {selectedVoter.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ID: {selectedVoter.state_voter_id} | County: {selectedVoter.county}
                  </p>
                </Card>

                <div className="space-y-2">
                  <Label htmlFor="type">Interaction Type</Label>
                  <Select value={type} onValueChange={(value: InteractionType) => setType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="door_knock">Door Knock</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any additional notes about the interaction..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedVoter(null);
                      setSearchResults([]);
                    }}
                  >
                    Back to Search
                  </Button>
                  <Button
                    onClick={() => createInteractionMutation.mutate()}
                    disabled={createInteractionMutation.isPending}
                  >
                    Save Interaction
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};