
import { useState } from "react";
import { PetitionPreview } from "@/components/petition/PetitionPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PetitionData } from "@/components/petition/types";
import { PetitionWizard } from "@/components/petition/PetitionWizard";
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import { toast } from "sonner";
import { generatePetitionPDF } from "@/components/petition/petitionUtils";

export default function DesignatingPetition() {
  const [activeTab, setActiveTab] = useState("form");
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!petitionData.party) {
      toast.warning("Please enter a political party name first", {
        description: "A party name is required for the petition document."
      });
      return;
    }
    
    if (petitionData.candidates.length === 0) {
      toast.warning("Please add at least one candidate", {
        description: "Candidates are required for the petition document."
      });
      return;
    }
    
    try {
      generatePetitionPDF(petitionData);
      toast.success("PDF generated successfully", {
        description: "Your designating petition has been downloaded."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", {
        description: "An error occurred while creating your petition document."
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Designating Petition Generator</h1>
        <p className="text-muted-foreground">
          Create official designating petitions for candidates running for office in New York State.
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <div className="flex justify-between items-center mb-2">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="form" data-value="form">Form</TabsTrigger>
            <TabsTrigger value="preview" data-value="preview">Preview</TabsTrigger>
          </TabsList>
          
          {activeTab === "preview" && (
            <div className="space-x-2 hidden md:block">
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
                Download PDF
              </Button>
            </div>
          )}
        </div>
        
        <TabsContent value="form" className="mt-4">
          <Card className="p-6">
            <PetitionWizard 
              petitionData={petitionData} 
              setPetitionData={setPetitionData} 
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card className="p-0 overflow-hidden border print:border-none print:shadow-none">
            <div className="md:hidden flex justify-center gap-2 p-2 border-b">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="bg-gray-50"
                size="sm"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownload}
                className="bg-gray-50"
                size="sm"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
            <div className="p-2 md:p-4 overflow-auto print:p-0">
              <PetitionPreview petitionData={petitionData} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
