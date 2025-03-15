
import { useState } from "react";
import { PetitionData, PetitionWizardProps } from "./types";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { CandidatesStep } from "./steps/CandidatesStep";
import { CommitteeStep } from "./steps/CommitteeStep";
import { OptionsStep } from "./steps/OptionsStep";

export function PetitionWizard({ petitionData, setPetitionData }: PetitionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Basic Information",
    "Candidates",
    "Committee to Fill Vacancies",
    "Options"
  ];

  const updatePetitionData = (data: Partial<PetitionData>) => {
    setPetitionData({ ...petitionData, ...data });
  };

  const handleNext = () => {
    setCurrentStep(current => Math.min(current + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(current => Math.max(current - 1, 0));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{steps[currentStep]}</h2>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {currentStep === 0 && (
        <BasicInfoStep 
          petitionData={petitionData} 
          updatePetitionData={updatePetitionData} 
          onNext={handleNext} 
        />
      )}

      {currentStep === 1 && (
        <CandidatesStep 
          petitionData={petitionData} 
          updatePetitionData={updatePetitionData} 
          onNext={handleNext} 
          onBack={handleBack} 
        />
      )}

      {currentStep === 2 && (
        <CommitteeStep 
          petitionData={petitionData} 
          updatePetitionData={updatePetitionData} 
          onNext={handleNext} 
          onBack={handleBack} 
        />
      )}

      {currentStep === 3 && (
        <OptionsStep 
          petitionData={petitionData} 
          updatePetitionData={updatePetitionData} 
          onNext={handleNext} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
}
