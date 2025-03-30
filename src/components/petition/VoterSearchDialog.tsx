
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { VoterCard } from "@/components/search/voter-card/VoterCard";
import { CountySwitcher } from "@/components/CountySwitcher";
import { County } from "@/components/search/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { VoterSearchDialogProps } from "./types";

export function VoterSearchDialog({ open, setOpen, onSelectVoter }: VoterSearchDialogProps) {
  const [county, setCounty] = useState<County>("manhattan");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [searching, setSearching] = useState(false);
  
  const handleSearchClick = () => {
    setSearching(true);
    refetch();
  };
  
  const { data: voters, isLoading, refetch } = useQuery({
    queryKey: ['petition-voter-search', county, firstName, lastName],
    queryFn: async () => {
      if (!firstName && !lastName) return [];
      
      let query = supabase
        .from(county)
        .select('*');
        
      if (lastName) {
        query = query.ilike('last_name', `${lastName}%`);
      }
      
      if (firstName) {
        query = query.ilike('first_name', `${firstName}%`);
      }
      
      const { data, error } = await query.limit(10);
      
      if (error) {
        console.error("Error searching voters:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: false,
  });
  
  const handleSelect = (voter: any) => {
    onSelectVoter(voter, county);
    setOpen(false);
    resetSearch();
  };
  
  const resetSearch = () => {
    setFirstName("");
    setLastName("");
    setSearching(false);
  };
  
  const handleClose = () => {
    setOpen(false);
    resetSearch();
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search Voter Database</DialogTitle>
          <DialogDescription>
            Find a voter to use as a candidate on your petition. This ensures the name matches the voter registration record.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-lg font-medium">Search Criteria</h3>
              <div className="w-full sm:w-auto">
                <CountySwitcher 
                  county={county}
                  setCounty={setCounty}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  placeholder="Enter last name" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  placeholder="Enter first name" 
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSearchClick} 
              disabled={isLoading || (!firstName && !lastName)}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search Voters"
              )}
            </Button>
          </div>
          
          {searching && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Search Results</h3>
              
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : voters && voters.length > 0 ? (
                <div className="space-y-4">
                  {voters.map((voter) => (
                    <div key={voter.state_voter_id} className="relative">
                      <VoterCard
                        voter={voter}
                        county={county}
                        onPrint={() => {}}
                        hideAddToList
                      />
                      <div className="absolute top-4 right-4">
                        <Button 
                          onClick={() => handleSelect(voter)}
                          size="sm"
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">
                    {searching ? "No voters found matching your search criteria." : "Enter search criteria and click Search."}
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
