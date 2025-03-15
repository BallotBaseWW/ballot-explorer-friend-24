
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { WizardStepProps } from "../types";
import { ArrowLeft, CheckCircle, FileDown, Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function OptionsStep({ petitionData, updatePetitionData, onBack }: WizardStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validatePetition = () => {
    // Validate basic information
    if (!petitionData.party || !petitionData.electionDate || !petitionData.electionYear) {
      toast.error("Missing basic information", {
        description: "Please fill in all required fields in the Basic Information step."
      });
      return false;
    }
    
    // Validate candidates
    if (petitionData.candidates.length === 0) {
      toast.error("No candidates added", {
        description: "Please add at least one candidate to the petition."
      });
      return false;
    }
    
    // Validate committee members
    if (petitionData.committeeMembers.length < 3) {
      toast.error("Insufficient committee members", {
        description: "Please add at least three committee members to fill vacancies."
      });
      return false;
    }
    
    return true;
  };

  const handleComplete = () => {
    if (!validatePetition()) return;
    
    setIsSubmitting(true);
    
    // Simulate processing
    setTimeout(() => {
      // Switch to preview tab
      const previewTab = document.querySelector('[data-value="preview"]') as HTMLButtonElement;
      if (previewTab) {
        previewTab.click();
      }
      
      toast.success("Petition completed successfully!", {
        description: "You can now view, print, or download your petition."
      });
      
      setIsSubmitting(false);
    }, 800);
  };

  const handlePrint = () => {
    if (!validatePetition()) return;
    
    toast.info("Preparing to print...", {
      description: "Opening print dialog for petition."
    });
    
    // Switch to preview tab first
    const previewTab = document.querySelector('[data-value="preview"]') as HTMLButtonElement;
    if (previewTab) {
      previewTab.click();
    }
    
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDownload = () => {
    if (!validatePetition()) return;
    
    toast.info("Preparing download...", {
      description: "Your petition will download shortly."
    });
    
    // Switch to preview tab first
    const previewTab = document.querySelector('[data-value="preview"]') as HTMLButtonElement;
    if (previewTab) {
      previewTab.click();
    }
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700">Almost Done!</AlertTitle>
        <AlertDescription className="text-blue-600">
          Review your petition options below, then click Complete to generate your petition.
        </AlertDescription>
      </Alert>
      
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
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="signatureCount">Number of Signature Lines</Label>
            <p className="text-xs text-muted-foreground">
              How many signature lines to include (max 50)
            </p>
          </div>
          <div className="w-24">
            <input
              id="signatureCount"
              type="number"
              min="1"
              max="50"
              value={petitionData.signatureCount}
              onChange={(e) => updatePetitionData({ signatureCount: Math.min(50, Math.max(1, parseInt(e.target.value) || 10)) })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
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
        
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="bg-gray-50"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDownload}
            className="bg-gray-50"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleComplete}
            disabled={isSubmitting}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isSubmitting ? "Processing..." : "Complete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
