
import React, { useState } from "react";
import { SignatureValidation, ValidationResult } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Info, CheckCircle, XCircle, HelpCircle, User } from "lucide-react";
import { SignatureImageViewer } from "./SignatureImageViewer";
import { toast } from "sonner";

interface ValidationResultsProps {
  validationResults: ValidationResult;
  onSavePetition: () => void;
  onUpdateSignatureStatus: (signature: SignatureValidation, status: "valid" | "invalid" | "uncertain", reason?: string, matchedVoterId?: string) => void;
  isSaving: boolean;
}

export const ValidationResults = ({
  validationResults,
  onSavePetition,
  onUpdateSignatureStatus,
  isSaving,
}: ValidationResultsProps) => {
  const [selectedSignatureId, setSelectedSignatureId] = useState<number | string | null>(null);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number | null>(null);

  const stats = validationResults.stats;

  const COLORS = ["#16a34a", "#dc2626", "#f59e0b"];

  const pieData = [
    { name: "Valid", value: stats.valid },
    { name: "Invalid", value: stats.invalid },
    { name: "Uncertain", value: stats.uncertain },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge variant="success">Valid</Badge>;
      case "invalid":
        return <Badge variant="destructive">Invalid</Badge>;
      case "uncertain":
      default:
        return <Badge variant="warning">Needs Review</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "invalid":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "uncertain":
      default:
        return <HelpCircle className="h-5 w-5 text-amber-500" />;
    }
  };

  const selectedSignature = validationResults.signatures.find(
    (sig) => sig.id === selectedSignatureId
  );

  const handleSelectStatus = (status: "valid" | "invalid" | "uncertain") => {
    if (selectedSignature) {
      let matchedVoterId;
      
      // If a potential match is selected and status is valid, use that voter's ID
      if (selectedMatchIndex !== null && 
          selectedSignature.potential_matches && 
          selectedSignature.potential_matches[selectedMatchIndex] &&
          status === "valid") {
        matchedVoterId = selectedSignature.potential_matches[selectedMatchIndex].state_voter_id;
        onUpdateSignatureStatus(selectedSignature, status, "Manually verified", matchedVoterId);
        toast.success("Signature validated with selected voter match");
      } else {
        onUpdateSignatureStatus(selectedSignature, status);
        toast.success(`Signature marked as ${status}`);
      }
    }
  };

  const handleSelectMatch = (index: number) => {
    setSelectedMatchIndex(index);
  };

  return (
    <div className="space-y-6">
      <Card className="p-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Validation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="md:col-span-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-muted-foreground">Valid</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {stats.valid}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-muted-foreground">Invalid</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {stats.invalid}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-muted-foreground">Needs Review</p>
                  <p className="text-2xl font-semibold text-amber-600">
                    {stats.uncertain}
                  </p>
                </div>

                <div className="col-span-3 p-3 bg-gray-50 rounded-md mt-2">
                  <p className="text-sm text-muted-foreground">Total Signatures</p>
                  <p className="text-2xl font-semibold">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={onSavePetition} disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Petition"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-lg font-medium">Signatures</h3>
          <div className="border rounded-md overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              {validationResults.signatures.map((signature) => (
                <div
                  key={signature.id}
                  className={`p-3 border-b flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                    selectedSignatureId === signature.id
                      ? "bg-gray-100"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedSignatureId(signature.id);
                    setSelectedMatchIndex(null);
                  }}
                >
                  <div>
                    <p className="font-medium">{signature.name}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                      {signature.address}
                    </p>
                  </div>
                  <div>{getStatusIcon(signature.status)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {selectedSignature ? (
            <>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">Signature Details</h3>
                <div>{getStatusBadge(selectedSignature.status)}</div>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="text-lg">{selectedSignature.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p>{selectedSignature.address}</p>
                    </div>
                    {selectedSignature.reason && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Validation Note</p>
                        <p className="flex items-center">
                          <Info className="h-4 w-4 mr-1 inline" />
                          {selectedSignature.reason}
                        </p>
                      </div>
                    )}
                    <Separator />

                    {/* Potential matches section */}
                    {selectedSignature.potential_matches && selectedSignature.potential_matches.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Potential Voter Matches:</p>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {selectedSignature.potential_matches.map((match, index) => (
                            <div 
                              key={index}
                              className={`p-2 border rounded-md cursor-pointer hover:bg-gray-50 flex items-start ${
                                selectedMatchIndex === index ? "bg-gray-100 border-primary" : ""
                              }`}
                              onClick={() => handleSelectMatch(index)}
                            >
                              <User className="h-5 w-5 mr-2 mt-1 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{match.first_name} {match.last_name}</p>
                                <p className="text-sm text-muted-foreground">{match.address}</p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {match.enrolled_party && (
                                    <Badge variant="outline" className="text-xs">
                                      {match.enrolled_party}
                                    </Badge>
                                  )}
                                  {match.assembly_district && (
                                    <Badge variant="outline" className="text-xs">
                                      AD-{match.assembly_district}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Select a match and mark as valid if it's the correct voter
                        </div>
                      </div>
                    )}
                    
                    {selectedSignature.matched_voter && (
                      <div>
                        <p className="text-sm font-medium mb-2">Matched Voter:</p>
                        <div className="p-3 border rounded-md">
                          <p className="font-medium">
                            {selectedSignature.matched_voter.first_name}{" "}
                            {selectedSignature.matched_voter.last_name}
                          </p>
                          <p className="text-sm">
                            {selectedSignature.matched_voter.address}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {selectedSignature.matched_voter.enrolled_party && (
                              <Badge variant="outline" className="text-xs">
                                {selectedSignature.matched_voter.enrolled_party}
                              </Badge>
                            )}
                            {selectedSignature.matched_voter.assembly_district && (
                              <Badge variant="outline" className="text-xs">
                                AD-{selectedSignature.matched_voter.assembly_district}
                              </Badge>
                            )}
                            {selectedSignature.matched_voter.state_senate_district && (
                              <Badge variant="outline" className="text-xs">
                                SD-{selectedSignature.matched_voter.state_senate_district}
                              </Badge>
                            )}
                            {selectedSignature.matched_voter.congressional_district && (
                              <Badge variant="outline" className="text-xs">
                                CD-{selectedSignature.matched_voter.congressional_district}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    {selectedSignature.image_region && (
                      <div>
                        <p className="text-sm font-medium mb-2">Signature Image:</p>
                        <SignatureImageViewer
                          signature={selectedSignature}
                          height={100}
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="success"
                        onClick={() => handleSelectStatus("valid")}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Valid
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleSelectStatus("invalid")}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" /> Invalid
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSelectStatus("uncertain")}
                        className="flex-1"
                      >
                        <HelpCircle className="h-4 w-4 mr-2" /> Uncertain
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center h-[400px] border rounded-md bg-gray-50">
              <p className="text-muted-foreground">
                Select a signature to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
