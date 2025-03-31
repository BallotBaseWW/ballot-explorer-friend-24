
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/signature-validator/FileUploader";
import { ValidationResults } from "@/components/signature-validator/ValidationResults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValidationResult } from "@/components/signature-validator/types";
import { processUploadedFiles } from "@/components/signature-validator/validation-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureImageViewer } from "@/components/signature-validator/SignatureImageViewer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, UploadIcon, CheckSquare, ClipboardList } from "lucide-react";
import { PetitionActions } from "@/components/signature-validator/PetitionActions";
import { useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema for petition metadata form
const petitionFormSchema = z.object({
  petitionName: z.string().min(1, "Petition name is required"),
  volumeNumber: z.string().optional(),
  petitionType: z.enum(["designating", "opportunity", "independent"]),
  party: z.string().optional(),
  coverage: z.enum(["district", "citywide"]),
  assemblyDistrict: z.string().optional(),
  congressionalDistrict: z.string().optional(),
  cityCouncilDistrict: z.string().optional(),
  senateDistrict: z.string().optional(),
  races: z.array(z.string()).optional(),
});

type PetitionFormValues = z.infer<typeof petitionFormSchema>;

export default function SignatureValidator() {
  const [activeTab, setActiveTab] = useState("metadata");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [district, setDistrict] = useState("AD-73");
  const [districtType, setDistrictType] = useState("AD");
  const [districtNumber, setDistrictNumber] = useState("73");
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | number | null>(null);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  const [petitionMetadata, setPetitionMetadata] = useState<PetitionFormValues | null>(null);
  const navigate = useNavigate();

  // Initialize form with react-hook-form
  const form = useForm<PetitionFormValues>({
    resolver: zodResolver(petitionFormSchema),
    defaultValues: {
      petitionName: "",
      volumeNumber: "",
      petitionType: "designating",
      party: "DEM",
      coverage: "district",
      assemblyDistrict: "",
      congressionalDistrict: "",
      cityCouncilDistrict: "",
      senateDistrict: "",
      races: [],
    },
  });

  const petitionType = form.watch("petitionType");
  const coverageType = form.watch("coverage");

  const onSubmitMetadata = (data: PetitionFormValues) => {
    console.log("Petition metadata:", data);
    setPetitionMetadata(data);
    
    // Set district based on form data
    let districtValue = "";
    if (data.coverage === "district") {
      if (data.assemblyDistrict) {
        districtValue = `AD-${data.assemblyDistrict}`;
      } else if (data.congressionalDistrict) {
        districtValue = `CD-${data.congressionalDistrict}`;
      } else if (data.cityCouncilDistrict) {
        districtValue = `CC-${data.cityCouncilDistrict}`;
      } else if (data.senateDistrict) {
        districtValue = `SD-${data.senateDistrict}`;
      }
    } else {
      districtValue = "CITYWIDE";
    }
    
    setDistrict(districtValue);
    setActiveTab("upload");
  };

  const handleFileSelection = (files: File[]) => {
    setUploadedFiles(files);
    
    // Create preview URLs for the files
    const urls = files.map(file => URL.createObjectURL(file));
    setFilePreviewUrls(urls);
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
  
  const handlePetitionSaved = (petitionId: string) => {
    // Redirect to the petition details page after saving
    navigate(`/petitions/${petitionId}`);
  };

  return (
    <div className="w-full py-6 px-4 md:px-6 pb-16 mb-16">
      <div className="mb-6 mt-2">
        <h1 className="text-2xl md:text-3xl font-bold">Signature Validator</h1>
        <p className="text-muted-foreground mt-1">
          Upload petition pages to validate signatures using AI
        </p>
      </div>

      <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>AI-Powered Signature Detection</AlertTitle>
        <AlertDescription>
          This tool uses AI to extract signatures from petition pages, then matches them against voter records.
          The AI analyzes each page to find signatures, extracts names and addresses, and validates them against your voter database.
        </AlertDescription>
      </Alert>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Petition Details
          </TabsTrigger>
          <TabsTrigger value="upload" disabled={!petitionMetadata} className="flex items-center gap-2">
            <UploadIcon className="h-4 w-4" /> Upload
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!validationResults} className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" /> Results
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="metadata" className="mt-4">
          <Card className="p-4 md:p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Petition Information</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitMetadata)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="petitionName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Petition Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter petition name" {...field} />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for this petition
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="volumeNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Volume Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Vol. 1" {...field} />
                          </FormControl>
                          <FormDescription>
                            If this petition has multiple volumes
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="petitionType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Petition Type*</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="designating" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Designating Petition
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="opportunity" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Opportunity to Ballot Petition
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="independent" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Independent Nominating Petition
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {(petitionType === "designating" || petitionType === "opportunity") && (
                    <FormField
                      control={form.control}
                      name="party"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Party*</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select party" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DEM">Democratic</SelectItem>
                              <SelectItem value="REP">Republican</SelectItem>
                              <SelectItem value="CON">Conservative</SelectItem>
                              <SelectItem value="WOR">Working Families</SelectItem>
                              <SelectItem value="IND">Independence</SelectItem>
                              <SelectItem value="OTH">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="coverage"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Petition Coverage*</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="district" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                District-specific
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="citywide" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Citywide (All 5 Counties)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {coverageType === "district" && (
                    <div className="space-y-4 border p-4 rounded-md">
                      <h3 className="font-medium">Select District</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="assemblyDistrict"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assembly District</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 73" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="congressionalDistrict"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Congressional District</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 12" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cityCouncilDistrict"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City Council District</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 5" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="senateDistrict"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senate District</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 28" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormDescription>
                        At least one district must be selected
                      </FormDescription>
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="races"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Races on Petition</FormLabel>
                          <FormDescription>
                            Select which races appear on this petition
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {["Assembly", "Senate", "Congress", "City Council", "Mayor", "Public Advocate", 
                            "Comptroller", "Borough President", "District Leader", "Judicial Delegate"].map((race) => (
                            <FormField
                              key={race}
                              control={form.control}
                              name="races"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={race}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(race)}
                                        onCheckedChange={(checked) => {
                                          const currentValues = field.value || [];
                                          return checked
                                            ? field.onChange([...currentValues, race])
                                            : field.onChange(
                                                currentValues.filter(
                                                  (value) => value !== race
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {race}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full md:w-auto">Continue to Upload</Button>
                </form>
              </Form>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload" className="mt-4">
          <Card className="p-4 md:p-6">
            <div className="space-y-6">
              {petitionMetadata && (
                <div className="bg-muted p-4 rounded-md mb-4">
                  <h3 className="font-semibold text-lg mb-2">{petitionMetadata.petitionName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {petitionMetadata.petitionType.charAt(0).toUpperCase() + petitionMetadata.petitionType.slice(1)} Petition
                    </div>
                    {(petitionMetadata.petitionType === "designating" || petitionMetadata.petitionType === "opportunity") && (
                      <div>
                        <span className="font-medium">Party:</span> {petitionMetadata.party === "DEM" ? "Democratic" : 
                                        petitionMetadata.party === "REP" ? "Republican" : 
                                        petitionMetadata.party === "CON" ? "Conservative" : 
                                        petitionMetadata.party === "WOR" ? "Working Families" : 
                                        petitionMetadata.party === "IND" ? "Independence" : "Other"}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Coverage:</span> {petitionMetadata.coverage === "citywide" ? "Citywide" : "District"}
                    </div>
                    {petitionMetadata.coverage === "district" && (
                      <div className="col-span-3">
                        <span className="font-medium">Districts:</span> {" "}
                        {petitionMetadata.assemblyDistrict ? `AD-${petitionMetadata.assemblyDistrict}` : ""}
                        {petitionMetadata.congressionalDistrict ? `${petitionMetadata.assemblyDistrict ? ", " : ""}CD-${petitionMetadata.congressionalDistrict}` : ""}
                        {petitionMetadata.cityCouncilDistrict ? `${petitionMetadata.assemblyDistrict || petitionMetadata.congressionalDistrict ? ", " : ""}CC-${petitionMetadata.cityCouncilDistrict}` : ""}
                        {petitionMetadata.senateDistrict ? `${petitionMetadata.assemblyDistrict || petitionMetadata.congressionalDistrict || petitionMetadata.cityCouncilDistrict ? ", " : ""}SD-${petitionMetadata.senateDistrict}` : ""}
                      </div>
                    )}
                    {petitionMetadata.races && petitionMetadata.races.length > 0 && (
                      <div className="col-span-3">
                        <span className="font-medium">Races:</span> {petitionMetadata.races.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <FileUploader onFilesSelected={handleFileSelection} />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={validateSignatures} 
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4" />
                        Validate Signatures
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="mt-4">
          <Card className="p-4 md:p-6">
            {validationResults && (
              <div className="space-y-8">
                <PetitionActions 
                  validationResults={validationResults}
                  district={district}
                  currentPage={1}
                  onSaveSuccess={handlePetitionSaved}
                  petitionMetadata={petitionMetadata}
                />
                
                <ValidationResults 
                  signatures={validationResults.signatures} 
                  stats={validationResults.stats}
                  selectedSignatureId={selectedSignatureId}
                  onSignatureSelect={handleSignatureClick}
                />
                
                {filePreviewUrls.length > 0 && validationResults.signatures.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Petition Pages</h3>
                    <div className="space-y-8">
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
    </div>
  );
}
