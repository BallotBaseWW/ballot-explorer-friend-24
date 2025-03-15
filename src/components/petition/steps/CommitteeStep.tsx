
import { Button } from "@/components/ui/button";
import { WizardStepProps, CommitteeMember } from "../types";
import { CommitteeMemberForm } from "../CommitteeMemberForm";
import { ArrowLeft, ArrowRight, PlusCircle } from "lucide-react";
import { useState } from "react";
import { VoterSearchDialog } from "../VoterSearchDialog";
import { County } from "@/components/search/types";
import { v4 as uuidv4 } from "uuid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function CommitteeStep({ petitionData, updatePetitionData, onNext, onBack }: WizardStepProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  
  const handleAddMember = () => {
    const newMember: CommitteeMember = {
      id: uuidv4(),
      name: "",
      residence: "",
    };
    
    updatePetitionData({
      committeeMembers: [...petitionData.committeeMembers, newMember],
    });
  };

  const handleUpdateMember = (index: number, updatedMember: CommitteeMember) => {
    const updatedMembers = [...petitionData.committeeMembers];
    updatedMembers[index] = updatedMember;
    
    updatePetitionData({
      committeeMembers: updatedMembers,
    });
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = petitionData.committeeMembers.filter((_, i) => i !== index);
    
    updatePetitionData({
      committeeMembers: updatedMembers,
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
    
    const updatedMember = {
      ...petitionData.committeeMembers[currentEditingIndex],
      name: fullName,
      residence: residence,
      voterData: voter,
    };
    
    handleUpdateMember(currentEditingIndex, updatedMember);
    setSearchOpen(false);
  };
  
  const isValid = petitionData.committeeMembers.length >= 3 &&
    petitionData.committeeMembers.every(member => member.name && member.residence);
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Add at least three persons as committee members, all of whom must be enrolled voters of the party.
        </p>
        {!isValid && petitionData.committeeMembers.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation</AlertTitle>
            <AlertDescription>
              You need at least three committee members with complete information.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {petitionData.committeeMembers.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">No committee members added yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {petitionData.committeeMembers.map((member, index) => (
            <CommitteeMemberForm
              key={member.id}
              member={member}
              index={index}
              onUpdate={handleUpdateMember}
              onRemove={handleRemoveMember}
              onSearch={() => handleOpenSearch(index)}
            />
          ))}
        </div>
      )}
      
      <Button 
        type="button" 
        variant="outline" 
        className="w-full" 
        onClick={handleAddMember}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Committee Member
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
          disabled={!isValid}
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
