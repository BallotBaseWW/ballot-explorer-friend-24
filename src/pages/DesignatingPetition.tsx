
import { useState } from "react";
import { PetitionForm } from "@/components/petition/PetitionForm";
import { PetitionPreview } from "@/components/petition/PetitionPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PetitionData } from "@/components/petition/types";
import { PetitionWizard } from "@/components/petition/PetitionWizard";

export default function DesignatingPetition() {
  const [petitionData, setPetitionData] = useState<PetitionData>({
    party: "",
    electionDate: "",
    electionYear: new Date().getFullYear().toString(),
    candidates: [],
    committeeMembers: [],
    showNotary: true,
    showWitness: true,
    signatureCount: 10,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Designating Petition Generator</h1>
        <p className="text-muted-foreground">
          Create official designating petitions for candidates running for office in New York State.
        </p>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="form" className="mt-4">
          <Card className="p-6">
            <PetitionWizard petitionData={petitionData} setPetitionData={setPetitionData} />
          </Card>
        </TabsContent>
        <TabsContent value="preview" className="mt-4">
          <Card className="p-6">
            <PetitionPreview petitionData={petitionData} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
