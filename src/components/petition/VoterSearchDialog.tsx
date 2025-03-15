
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { CountySwitcher } from "@/components/CountySwitcher";
import { County } from "@/components/search/types";
import { VoterCard } from "@/components/search/voter-card/VoterCard";

interface VoterSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoterSelect: (voter: any, county: string) => void;
}

export const VoterSearchDialog = ({ open, onOpenChange, onVoterSelect }: VoterSearchDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [county, setCounty] = useState<County>("bronx");
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!lastName) {
      toast({
        title: "Last name required",
        description: "Please enter at least a last name to search",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSearchResults([]);

    try {
      const countyTable = county.toLowerCase() as County;
      let query = supabase.from(countyTable).select();

      // Apply last name filter
      query = query.ilike('last_name', `${lastName}%`);

      // Apply first name filter if provided
      if (firstName) {
        query = query.ilike('first_name', `${firstName}%`);
      }

      const { data, error } = await query
        .order('last_name', { ascending: true })
        .limit(10);

      if (error) {
        throw error;
      }

      setSearchResults(data || []);

      if (!data || data.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your search criteria",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error performing search",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountyChange = (newCounty: County) => {
    setCounty(newCounty);
    setSearchResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search for Voter</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <CountySwitcher currentCounty={county} onCountyChange={handleCountyChange} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                onKeyDown={handleKeyDown}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name (required)"
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Search
          </Button>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {searchResults.map((voter) => (
                <div key={voter.state_voter_id} className="relative">
                  <VoterCard voter={voter} county={county} onPrint={() => {}} hideAddToList />
                  <div className="absolute top-4 right-4">
                    <Button onClick={() => onVoterSelect(voter, county)}>Select</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
