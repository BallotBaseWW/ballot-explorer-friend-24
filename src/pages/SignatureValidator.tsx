
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/signature-validator/FileUploader";
import { ValidationResults } from "@/components/signature-validator/ValidationResults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import { ValidationResult } from "@/components/signature-validator/types";
import { processUploadedFiles } from "@/components/signature-validator/validation-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureImageViewer } from "@/components/signature-validator/SignatureImageViewer";

export default function SignatureValidator() {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [district, setDistrict] = useState("AD-73");
  const [districtType, setDistrictType] = useState("AD");
  const [districtNumber, setDistrictNumber] = useState("73");
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | number | null>(null);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  const handleFileSelection = (files: File[]) => {
    setUploadedFiles(files);
    
    // Create preview URLs for the files
    const urls = files.map(file => URL.createObjectURL(file));
    setFilePreviewUrls(urls);
  };

  const handleDistrictTypeChange = (value: string) => {
    setDistrictType(value);
    setDistrict(`${value}-${districtNumber}`);
  };

  const handleDistrictNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDistrictNumber(e.target.value);
    setDistrict(`${districtType}-${e.target.value}`);
  };

  const validateSignatures = async () => {
    if (uploadedFiles.length === 0) {
      return;
    }

    setIsProcessing(true);
    try {
      const results = await processUploadedFiles(uploadedFiles, district);
      setValidationResults(results);
      setActiveTab("results");
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignatureClick = (signature: any) => {
    setSelectedSignatureId(signature.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <Header />
            <main className="max-w-7xl mx-auto p-4">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">Signature Validator</h1>
                <p className="text-muted-foreground">
                  Upload petition pages to validate signatures using AI
                </p>
              </div>

              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="results" disabled={!validationResults}>Results</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-4">
                  <Card className="p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Petition District</h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="district-type">District Type</Label>
                                <Select 
                                  value={districtType} 
                                  onValueChange={handleDistrictTypeChange}
                                >
                                  <SelectTrigger id="district-type">
                                    <SelectValue placeholder="Select district type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="AD">Assembly District (AD)</SelectItem>
                                    <SelectItem value="SD">Senate District (SD)</SelectItem>
                                    <SelectItem value="CD">Congressional District (CD)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="district-number">District Number</Label>
                                <Input 
                                  id="district-number" 
                                  type="text" 
                                  value={districtNumber} 
                                  onChange={handleDistrictNumberChange} 
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Current District</Label>
                              <div className="text-lg font-semibold">{district}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-l pl-6 md:block hidden"></div>
                      </div>
                      
                      <div className="pt-6">
                        <FileUploader onFilesSelected={handleFileSelection} />
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 flex justify-end">
                          <Button 
                            onClick={validateSignatures} 
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Processing..." : "Validate Signatures"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="results" className="mt-4">
                  <Card className="p-6">
                    {validationResults && (
                      <div className="space-y-8">
                        <ValidationResults 
                          signatures={validationResults.signatures} 
                          stats={validationResults.stats}
                          selectedSignatureId={selectedSignatureId}
                          onSignatureSelect={handleSignatureClick}
                        />
                        
                        {filePreviewUrls.length > 0 && validationResults.signatures.length > 0 && (
                          <div className="mt-8">
                            <h3 className="text-lg font-medium mb-4">Petition Pages</h3>
                            <div className="space-y-4">
                              {filePreviewUrls.map((url, index) => (
                                <div key={index} className="border rounded-md p-4">
                                  <h4 className="text-md font-medium mb-3">Page {index + 1}</h4>
                                  <SignatureImageViewer 
                                    imageUrl={url}
                                    signatures={validationResults.signatures.filter(sig => sig.page_number === index + 1)}
                                    selectedSignatureId={selectedSignatureId}
                                    onSignatureClick={handleSignatureClick}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
