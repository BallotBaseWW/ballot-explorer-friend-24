
import { useState } from "react";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PetitionForm } from "@/components/petition/PetitionForm";
import { PetitionPreview } from "@/components/petition/PetitionPreview";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type PetitionData = {
  party: string;
  electionDate: string;
  electionYear: string;
  candidates: CandidateInfo[];
  committeeMembers: string;
  showNotary: boolean;
  witnessName: string;
  witnessParty: string;
  witnessResidence: string;
  witnessTown: string;
  witnessCounty: string;
  notarySignatureCount: string;
};

export type CandidateInfo = {
  name: string;
  position: string;
  district: string;
  address: string;
  postOfficeAddress?: string;
};

const DesignatingPetition = () => {
  const [petitionData, setPetitionData] = useState<PetitionData>({
    party: "",
    electionDate: "",
    electionYear: new Date().getFullYear().toString(),
    candidates: [{ name: "", position: "", district: "", address: "" }],
    committeeMembers: "",
    showNotary: false,
    witnessName: "",
    witnessParty: "",
    witnessResidence: "",
    witnessTown: "",
    witnessCounty: "",
    notarySignatureCount: "",
  });

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <Header />
            <main className="max-w-7xl mx-auto p-4">
              <h1 className="text-2xl font-bold mb-4">Designating Petition Generator</h1>
              <p className="text-muted-foreground mb-6">
                Create a designating petition for candidates running for office in New York State.
              </p>

              <Tabs defaultValue="form" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="form">Form</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="form">
                  <Card className="p-6">
                    <PetitionForm 
                      petitionData={petitionData} 
                      setPetitionData={setPetitionData} 
                    />
                  </Card>
                </TabsContent>
                <TabsContent value="preview">
                  <Card className="p-6">
                    <PetitionPreview petitionData={petitionData} />
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DesignatingPetition;
