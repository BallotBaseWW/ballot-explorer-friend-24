
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CommitteeMemberForm } from "@/components/petition/CommitteeMemberForm";
import { WizardStepProps, CommitteeMember } from "@/components/petition/types";
import { VoterSearchDialog } from "@/components/petition/VoterSearchDialog";
import { County } from "@/components/search/types";
import { PlusCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export function CommitteeStep({ 
  petitionData, 
  updatePetitionData, 
  onNext, 
  onBack 
}: WizardStepProps) {
  const [useTextArea, setUseTextArea] = useState(!!petitionData.committee);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);

  const handleAddMember = () => {
    const newMember: CommitteeMember = {
      id: uuidv4(),
      name: "",
      residence: "",
    };
    
    const updatedMembers = [...petitionData.committeeMembers, newMember];
    updatePetitionData({ committeeMembers: updatedMembers });
  };

  const handleUpdateMember = (index: number, updatedMember: CommitteeMember) => {
    const updatedMembers = [...petitionData.committeeMembers];
    updatedMembers[index] = updatedMember;
    
    updatePetitionData({ committeeMembers: updatedMembers });
  };

  const handleRemoveMember = (index: number) => {
    const updatedMembers = petitionData.committeeMembers.filter((_, i) => i !== index);
    updatePetitionData({ committeeMembers: updatedMembers });
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
  
  const toggleInputMethod = (checked: boolean) => {
    setUseTextArea(checked);
    
    if (checked) {
      // Convert committee members to a text string
      if (petitionData.committeeMembers.length > 0) {
        const committeeText = petitionData.committeeMembers
          .map(member => `${member.name}, residing at ${member.residence}`)
          .join("; ");
        
        updatePetitionData({ committee: committeeText, committeeMembers: [] });
      } else {
        updatePetitionData({ committee: "", committeeMembers: [] });
      }
    } else {
      // Clear the committee text when switching to individual members
      updatePetitionData({ committee: undefined });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="useTextArea" 
          checked={useTextArea} 
          onCheckedChange={toggleInputMethod} 
        />
        <Label htmlFor="useTextArea">
          Enter committee members as a single text block
        </Label>
      </div>
      
      {useTextArea ? (
        <div className="space-y-2">
          <Label htmlFor="committee">Committee Members</Label>
          <Textarea 
            id="committee" 
            value={petitionData.committee || ""} 
            onChange={(e) => updatePetitionData({ committee: e.target.value })} 
            placeholder="Enter names and addresses of at least three enrolled voters of the party"
            rows={6}
          />
          <p className="text-xs text-muted-foreground">
            Enter the names and addresses of at least three persons, all of whom shall be enrolled voters of said party.
            Format example: "John Doe, residing at 123 Main St, Anytown, NY; Jane Smith, residing at 456 Oak Ave, Othertown, NY"
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add at least three committee members who are enrolled voters of the party. 
            These individuals will have the authority to fill vacancies if needed.
          </p>
          
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
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          type="button" 
          onClick={onNext}
        >
          Next
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
