
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ValidationResult, SignatureValidation } from "./types";
import { savePetitionPage } from "./petition-service";
import { AddToListDialog } from "@/components/search/voter-lists/AddToListDialog";
import { BookmarkIcon, Save, Filter, ListPlus } from "lucide-react";

interface PetitionActionsProps {
  validationResults: ValidationResult;
  district: string;
  currentPage: number;
  onSaveSuccess?: (petitionId: string) => void;
  petitionMetadata?: any; // Optional metadata from the form
}

export function PetitionActions({ validationResults, district, currentPage, onSaveSuccess, petitionMetadata }: PetitionActionsProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [petitionName, setPetitionName] = useState(petitionMetadata?.petitionName || "");
  const [party, setParty] = useState(petitionMetadata?.party || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showAddVoterDialog, setShowAddVoterDialog] = useState(false);
  
  const validSignatures = validationResults?.signatures.filter(sig => sig.status === "valid") || [];
  const validSignaturesWithVoters = validSignatures.filter(sig => sig.matched_voter?.state_voter_id);
  
  const handleSavePetition = async () => {
    if (!petitionName) {
      toast.error("Petition name required", {
        description: "Please enter a name for this petition"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Include petition metadata if available
      const petitionData = {
        petitionName,
        district,
        party,
        validationResults,
        page: currentPage,
        metadata: petitionMetadata || {}
      };
      
      const petitionId = await savePetitionPage(petitionData);
      
      toast.success("Petition saved successfully", {
        description: `Saved page ${currentPage} with ${validationResults.signatures.length} signatures`
      });
      
      setIsSaveDialogOpen(false);
      
      if (onSaveSuccess) {
        onSaveSuccess(petitionId);
      }
    } catch (error) {
      console.error("Failed to save petition:", error);
      toast.error("Failed to save petition", {
        description: "There was an error saving the petition data"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Prepare the voter data for adding to a list
  const voterData = validSignaturesWithVoters.map(sig => ({
    state_voter_id: sig.matched_voter!.state_voter_id,
    name: sig.name
  }));
  
  // Determine which county to use (defaulting to Staten Island)
  const getCountyFromSignatures = () => {
    const counties = validSignaturesWithVoters.map(sig => {
      const address = sig.address.toLowerCase();
      if (address.includes('staten island') || address.includes('richmond')) return 'statenisland';
      if (address.includes('brooklyn') || address.includes('kings')) return 'brooklyn';
      if (address.includes('bronx')) return 'bronx';
      if (address.includes('queens')) return 'queens';
      if (address.includes('manhattan') || address.includes('new york')) return 'manhattan';
      return 'statenisland'; // Default
    });
    
    // Use the most common county
    const countMap: Record<string, number> = {};
    counties.forEach(county => {
      countMap[county] = (countMap[county] || 0) + 1;
    });
    
    let mostCommonCounty = 'statenisland';
    let highestCount = 0;
    
    Object.entries(countMap).forEach(([county, count]) => {
      if (count > highestCount) {
        mostCommonCounty = county;
        highestCount = count;
      }
    });
    
    return mostCommonCounty;
  };
  
  // Display info about petition type
  const getPetitionTypeDisplay = () => {
    if (!petitionMetadata) return null;
    
    let typeInfo = "";
    
    if (petitionMetadata.petitionType === "designating") {
      typeInfo = "Designating Petition";
    } else if (petitionMetadata.petitionType === "opportunity") {
      typeInfo = "Opportunity to Ballot Petition";
    } else if (petitionMetadata.petitionType === "independent") {
      typeInfo = "Independent Nominating Petition";
    }
    
    if ((petitionMetadata.petitionType === "designating" || petitionMetadata.petitionType === "opportunity") 
         && petitionMetadata.party) {
      const partyName = petitionMetadata.party === "DEM" ? "Democratic" : 
                        petitionMetadata.party === "REP" ? "Republican" : 
                        petitionMetadata.party === "CON" ? "Conservative" : 
                        petitionMetadata.party === "WOR" ? "Working Families" : 
                        petitionMetadata.party === "IND" ? "Independence" : "Other";
      typeInfo += ` (${partyName})`;
    }
    
    return typeInfo;
  };
  
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-2"
            onClick={() => setIsSaveDialogOpen(true)}
          >
            <Save className="h-4 w-4" />
            <span className="text-sm">Save Petition Page</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 h-auto py-2"
            onClick={() => setShowAddVoterDialog(true)}
            disabled={validSignaturesWithVoters.length === 0}
          >
            <ListPlus className="h-4 w-4" />
            <span className="text-sm">Add Valid Signatures ({validSignaturesWithVoters.length})</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-auto py-2" 
            onClick={() => window.location.href = '/petitions'}
          >
            <BookmarkIcon className="h-4 w-4" />
            <span className="text-sm">My Petitions</span>
          </Button>
        </div>
      </Card>
      
      {/* Save Petition Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Petition Page</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="petition-name">Petition Name</Label>
              <Input
                id="petition-name"
                placeholder="Enter name for this petition"
                value={petitionName}
                onChange={(e) => setPetitionName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use the same name when uploading multiple pages of the same petition
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="petition-party">Political Party</Label>
              <Input
                id="petition-party"
                placeholder="e.g., Democratic, Republican"
                value={party}
                onChange={(e) => setParty(e.target.value)}
              />
            </div>
            
            <div className="pt-2">
              <p className="text-sm font-medium">District: {district}</p>
              {petitionMetadata && getPetitionTypeDisplay() && (
                <p className="text-sm font-medium">Type: {getPetitionTypeDisplay()}</p>
              )}
              <p className="text-sm font-medium">
                Signatures: {validationResults.stats.total} 
                (Valid: {validationResults.stats.valid}, 
                Invalid: {validationResults.stats.invalid}, 
                Uncertain: {validationResults.stats.uncertain})
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePetition} 
              disabled={isSaving || !petitionName}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Petition'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Voters to List Dialog */}
      {showAddVoterDialog && (
        <Dialog open={showAddVoterDialog} onOpenChange={setShowAddVoterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Matched Voters to List</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-4">
                Add {validSignaturesWithVoters.length} matched voters to a voter list:
              </p>
              
              <AddToListDialog 
                voters={voterData.map(voter => ({ state_voter_id: voter.state_voter_id }))} 
                county={getCountyFromSignatures()} 
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
