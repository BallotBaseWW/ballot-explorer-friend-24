
import { Button } from "@/components/ui/button";
import { WizardStepProps, Candidate } from "../types";
import { CandidateForm } from "../CandidateForm";
import { ArrowLeft, ArrowRight, PlusCircle } from "lucide-react";
import { useState } from "react";
import { VoterSearchDialog } from "../VoterSearchDialog";
import { County } from "@/components/search/types";
import { v4 as uuidv4 } from "uuid";

export function CandidatesStep({ petitionData, updatePetitionData, onNext, onBack }: WizardStepProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  
  const handleAddCandidate = () => {
    const newCandidate: Candidate = {
      id: uuidv4(),
      name: "",
      position: "",
      residence: "",
    };
    
    updatePetitionData({
      candidates: [...petitionData.candidates, newCandidate],
    });
  };

  const handleUpdateCandidate = (index: number, updatedCandidate: Candidate) => {
    const updatedCandidates = [...petitionData.candidates];
    updatedCandidates[index] = updatedCandidate;
    
    updatePetitionData({
      candidates: updatedCandidates,
    });
  };

  const handleRemoveCandidate = (index: number) => {
    const updatedCandidates = petitionData.candidates.filter((_, i) => i !== index);
    
    updatePetitionData({
      candidates: updatedCandidates,
    });
  };

  const handleOpenSearch = (index: number) => {
    setCurrentEditingIndex(index);
    setSearchOpen(true);
  };

  const handleSelectVoter = (voter: any, county: County) => {
    if (currentEditingIndex === null) return;
    
    const fullName = `${voter.first_name || ""} ${voter.middle || ""} ${voter.last_name || ""} ${voter.suffix || ""}`.trim();
    const residence = `${voter.house || ""} ${voter.street_name || ""}, ${voter.residence_city || ""}, NY ${voter.zip_code || ""}`.trim();
    
    const updatedCandidate = {
      ...petitionData.candidates[currentEditingIndex],
      name: fullName,
      residence: residence,
      voterData: voter,
    };
    
    handleUpdateCandidate(currentEditingIndex, updatedCandidate);
    setSearchOpen(false);
  };
  
  return (
    <div className="space-y-6">
      {petitionData.candidates.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">No candidates added yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {petitionData.candidates.map((candidate, index) => (
            <CandidateForm 
              key={candidate.id}
              candidate={candidate}
              index={index}
              onUpdate={handleUpdateCandidate}
              onRemove={handleRemoveCandidate}
              onSearch={() => handleOpenSearch(index)}
            />
          ))}
        </div>
      )}
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full" 
        onClick={handleAddCandidate}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Candidate
      </Button>
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={petitionData.candidates.length === 0}
        >
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      <VoterSearchDialog 
        open={searchOpen} 
        setOpen={setSearchOpen} 
        onSelectVoter={handleSelectVoter} 
      />
    </div>
  );
}
