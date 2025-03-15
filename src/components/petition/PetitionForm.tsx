
import { useState } from "react";
import { PetitionData, CandidateInfo } from "@/pages/DesignatingPetition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Search } from "lucide-react";
import { VoterSearchDialog } from "./VoterSearchDialog";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl 
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface PetitionFormProps {
  petitionData: PetitionData;
  setPetitionData: React.Dispatch<React.SetStateAction<PetitionData>>;
}

export const PetitionForm = ({ petitionData, setPetitionData }: PetitionFormProps) => {
  const [openVoterSearch, setOpenVoterSearch] = useState(false);
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPetitionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setPetitionData((prev) => ({ ...prev, showNotary: checked }));
  };

  const handleCandidateChange = (index: number, field: keyof CandidateInfo, value: string) => {
    const updatedCandidates = [...petitionData.candidates];
    updatedCandidates[index] = { ...updatedCandidates[index], [field]: value };
    setPetitionData((prev) => ({ ...prev, candidates: updatedCandidates }));
  };

  const addCandidate = () => {
    setPetitionData((prev) => ({
      ...prev,
      candidates: [...prev.candidates, { name: "", position: "", district: "", address: "" }],
    }));
  };

  const removeCandidate = (index: number) => {
    if (petitionData.candidates.length > 1) {
      const filteredCandidates = petitionData.candidates.filter((_, i) => i !== index);
      setPetitionData((prev) => ({ ...prev, candidates: filteredCandidates }));
    }
  };

  const openVoterSearchForCandidate = (index: number) => {
    setCurrentCandidateIndex(index);
    setOpenVoterSearch(true);
  };

  const handleVoterSelected = (voter: any, county: string) => {
    // Combine voter address components
    const address = `${voter.house || ''} ${voter.house_suffix || ''} ${voter.pre_st_direction || ''} ${voter.street_name || ''} ${voter.post_st_direction || ''}, ${voter.aptunit_type || ''} ${voter.unit_no || ''}, ${voter.residence_city || ''}, NY ${voter.zip_code || ''}`.replace(/\s+/g, ' ').trim();
    
    // Full name
    const fullName = `${voter.first_name || ''} ${voter.middle || ''} ${voter.last_name || ''} ${voter.suffix || ''}`.replace(/\s+/g, ' ').trim();
    
    // Update candidate info
    handleCandidateChange(currentCandidateIndex, "name", fullName);
    handleCandidateChange(currentCandidateIndex, "address", address);
    
    // Close dialog
    setOpenVoterSearch(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="party">Party</Label>
          <Input
            id="party"
            name="party"
            value={petitionData.party}
            onChange={handleInputChange}
            placeholder="Democratic, Republican, etc."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="electionDate">Election Date</Label>
            <Input
              id="electionDate"
              name="electionDate"
              value={petitionData.electionDate}
              onChange={handleInputChange}
              placeholder="e.g., June 25"
            />
          </div>
          <div>
            <Label htmlFor="electionYear">Election Year</Label>
            <Input
              id="electionYear"
              name="electionYear"
              value={petitionData.electionYear}
              onChange={handleInputChange}
              placeholder="e.g., 2024"
            />
          </div>
        </div>
      </div>

      <Separator />
      <h3 className="text-lg font-medium">Candidates</h3>
      
      {petitionData.candidates.map((candidate, index) => (
        <Card key={index} className="p-4 relative">
          <div className="absolute right-4 top-4 flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => openVoterSearchForCandidate(index)}
              title="Search for candidate in voter database"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => removeCandidate(index)}
              disabled={petitionData.candidates.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor={`candidate-name-${index}`}>Name</Label>
              <Input
                id={`candidate-name-${index}`}
                value={candidate.name}
                onChange={(e) => handleCandidateChange(index, "name", e.target.value)}
                placeholder="Full name as registered"
              />
            </div>
            
            <div>
              <Label htmlFor={`candidate-position-${index}`}>Public Office or Party Position</Label>
              <Input
                id={`candidate-position-${index}`}
                value={candidate.position}
                onChange={(e) => handleCandidateChange(index, "position", e.target.value)}
                placeholder="e.g., Member of Assembly"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`candidate-district-${index}`}>District Number (if applicable)</Label>
              <Input
                id={`candidate-district-${index}`}
                value={candidate.district}
                onChange={(e) => handleCandidateChange(index, "district", e.target.value)}
                placeholder="e.g., 25th District"
              />
            </div>
            
            <div>
              <Label htmlFor={`candidate-address-${index}`}>Residence Address</Label>
              <Input
                id={`candidate-address-${index}`}
                value={candidate.address}
                onChange={(e) => handleCandidateChange(index, "address", e.target.value)}
                placeholder="Full address as registered"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor={`candidate-post-office-${index}`}>Post Office Address (if different)</Label>
            <Input
              id={`candidate-post-office-${index}`}
              value={candidate.postOfficeAddress || ""}
              onChange={(e) => handleCandidateChange(index, "postOfficeAddress", e.target.value)}
              placeholder="Alternative mailing address (optional)"
            />
          </div>
        </Card>
      ))}
      
      <Button type="button" onClick={addCandidate} className="w-full" variant="outline">
        <Plus className="mr-2 h-4 w-4" /> Add Another Candidate
      </Button>
      
      <Separator />
      
      <div>
        <Label htmlFor="committeeMembers">Committee Members</Label>
        <Textarea
          id="committeeMembers"
          name="committeeMembers"
          value={petitionData.committeeMembers}
          onChange={handleInputChange}
          placeholder="Names and addresses of at least three enrolled voters of the party"
          className="min-h-[100px]"
        />
      </div>

      <Separator />
      <h3 className="text-lg font-medium">Witness Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="witnessName">Witness Name</Label>
          <Input
            id="witnessName"
            name="witnessName"
            value={petitionData.witnessName}
            onChange={handleInputChange}
            placeholder="Full name of witness"
          />
        </div>
        
        <div>
          <Label htmlFor="witnessParty">Witness Party</Label>
          <Input
            id="witnessParty"
            name="witnessParty"
            value={petitionData.witnessParty}
            onChange={handleInputChange}
            placeholder="Political party of witness"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="witnessResidence">Witness Residence</Label>
        <Input
          id="witnessResidence"
          name="witnessResidence"
          value={petitionData.witnessResidence}
          onChange={handleInputChange}
          placeholder="Complete address of witness"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="witnessTown">Town/City Where Witness Resides</Label>
          <Input
            id="witnessTown"
            name="witnessTown"
            value={petitionData.witnessTown}
            onChange={handleInputChange}
            placeholder="Town or city name"
          />
        </div>
        
        <div>
          <Label htmlFor="witnessCounty">County Where Witness Resides</Label>
          <Input
            id="witnessCounty"
            name="witnessCounty"
            value={petitionData.witnessCounty}
            onChange={handleInputChange}
            placeholder="County name"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-notary"
          checked={petitionData.showNotary}
          onCheckedChange={handleSwitchChange}
        />
        <Label htmlFor="show-notary">Include Notary Section</Label>
      </div>
      
      {petitionData.showNotary && (
        <div>
          <Label htmlFor="notarySignatureCount">Number of Signatures (Notary)</Label>
          <Input
            id="notarySignatureCount"
            name="notarySignatureCount"
            value={petitionData.notarySignatureCount}
            onChange={handleInputChange}
            placeholder="Number of signatures"
          />
        </div>
      )}
      
      <VoterSearchDialog 
        open={openVoterSearch} 
        onOpenChange={setOpenVoterSearch}
        onVoterSelect={handleVoterSelected}
      />
    </div>
  );
};
