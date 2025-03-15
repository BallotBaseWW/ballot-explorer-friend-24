
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { WizardStepProps } from "../types";
import { ArrowRight } from "lucide-react";

export function BasicInfoStep({ petitionData, updatePetitionData, onNext }: WizardStepProps) {
  const isFormValid = !!petitionData.party && !!petitionData.electionDate && !!petitionData.electionYear;
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="party">Political Party</Label>
          <Input 
            id="party" 
            value={petitionData.party} 
            onChange={(e) => updatePetitionData({ party: e.target.value })} 
            placeholder="e.g., Democratic, Republican"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="electionDate">Election Date</Label>
          <Input 
            id="electionDate" 
            value={petitionData.electionDate} 
            onChange={(e) => updatePetitionData({ electionDate: e.target.value })} 
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
            onChange={(e) => updatePetitionData({ electionYear: e.target.value })} 
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
            onChange={(e) => updatePetitionData({ signatureCount: parseInt(e.target.value) })} 
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!isFormValid}
          className="w-full md:w-auto"
        >
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
