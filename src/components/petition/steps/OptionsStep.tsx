
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { WizardStepProps } from "../types";
import { ArrowLeft, CheckCircle } from "lucide-react";

export function OptionsStep({ petitionData, updatePetitionData, onBack }: WizardStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
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
            onCheckedChange={(checked) => updatePetitionData({ showWitness: checked })} 
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
            onCheckedChange={(checked) => updatePetitionData({ showNotary: checked })} 
          />
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete
        </Button>
      </div>
    </div>
  );
}
