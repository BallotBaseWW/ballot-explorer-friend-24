
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { PetitionData, Candidate } from "@/components/petition/types";
import { CandidateForm } from "@/components/petition/CandidateForm";
import { VoterSearchDialog } from "@/components/petition/VoterSearchDialog";
import { County } from "@/components/search/types";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

interface PetitionFormProps {
  petitionData: PetitionData;
  setPetitionData: (data: PetitionData) => void;
}

export function PetitionForm({ petitionData, setPetitionData }: PetitionFormProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  
  const form = useForm({
    defaultValues: petitionData,
  });

  const handleAddCandidate = () => {
    const newCandidate: Candidate = {
      id: uuidv4(),
      name: "",
      position: "",
      residence: "",
    };
    
    setPetitionData({
      ...petitionData,
      candidates: [...petitionData.candidates, newCandidate],
    });
  };

  const handleUpdateCandidate = (index: number, updatedCandidate: Candidate) => {
    const updatedCandidates = [...petitionData.candidates];
    updatedCandidates[index] = updatedCandidate;
    
    setPetitionData({
      ...petitionData,
      candidates: updatedCandidates,
    });
  };

  const handleRemoveCandidate = (index: number) => {
    const updatedCandidates = petitionData.candidates.filter((_, i) => i !== index);
    
    setPetitionData({
      ...petitionData,
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

  const handleFormChange = (field: keyof PetitionData, value: any) => {
    setPetitionData({
      ...petitionData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Petition Information</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="party">Political Party</Label>
            <Input 
              id="party" 
              value={petitionData.party} 
              onChange={(e) => handleFormChange("party", e.target.value)} 
              placeholder="e.g., Democratic, Republican"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="electionDate">Election Date</Label>
            <Input 
              id="electionDate" 
              value={petitionData.electionDate} 
              onChange={(e) => handleFormChange("electionDate", e.target.value)} 
              placeholder="e.g., June 25"
            />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="electionYear">Election Year</Label>
            <Input 
              id="electionYear" 
              value={petitionData.electionYear} 
              onChange={(e) => handleFormChange("electionYear", e.target.value)} 
              placeholder="e.g., 2024"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signatureCount">Number of Signature Lines</Label>
            <Input 
              id="signatureCount" 
              type="number" 
              min="1" 
              max="50" 
              value={petitionData.signatureCount} 
              onChange={(e) => handleFormChange("signatureCount", parseInt(e.target.value))} 
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Candidates</h2>
        <p className="text-sm text-muted-foreground">
          Add one or more candidates to be included on this designating petition.
        </p>
        
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
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Committee to Fill Vacancies</h2>
        <div className="space-y-2">
          <Label htmlFor="committee">Committee Members</Label>
          <Textarea 
            id="committee" 
            value={petitionData.committee} 
            onChange={(e) => handleFormChange("committee", e.target.value)} 
            placeholder="Enter names and addresses of at least three enrolled voters of the party"
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Enter the names and addresses of at least three persons, all of whom shall be enrolled voters of said party.
          </p>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Verification Options</h2>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="showWitness">Include Witness Statement</Label>
            <p className="text-xs text-muted-foreground">
              Statement of Witness verification section
            </p>
          </div>
          <Switch 
            id="showWitness" 
            checked={petitionData.showWitness} 
            onCheckedChange={(checked) => handleFormChange("showWitness", checked)} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="showNotary">Include Notary Section</Label>
            <p className="text-xs text-muted-foreground">
              Notary Public or Commissioner of Deeds verification section
            </p>
          </div>
          <Switch 
            id="showNotary" 
            checked={petitionData.showNotary} 
            onCheckedChange={(checked) => handleFormChange("showNotary", checked)} 
          />
        </div>
      </div>
      
      <VoterSearchDialog 
        open={searchOpen} 
        setOpen={setSearchOpen} 
        onSelectVoter={handleSelectVoter} 
      />
    </div>
  );
}
