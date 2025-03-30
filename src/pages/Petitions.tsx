
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPetitions, getPetitionById } from "@/components/signature-validator/petition-service";
import { PetitionProgress } from "@/components/signature-validator/types";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, FileSignature, PlusCircle, Book } from "lucide-react";
import { SurveyProgress } from "@/components/surveys/SurveyProgress";

export default function Petitions() {
  const [petitions, setPetitions] = useState<PetitionProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadPetitions = async () => {
      try {
        setIsLoading(true);
        const data = await getPetitions();
        setPetitions(data);
      } catch (error) {
        console.error("Error loading petitions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPetitions();
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <div className="flex-1 overflow-hidden">
            <Header />
            <main className="p-4 md:p-6 overflow-auto" style={{ height: 'calc(100vh - 64px)' }}>
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold">My Petitions</h1>
                    <p className="text-muted-foreground">
                      Track and manage your designating petitions
                    </p>
                  </div>
                  
                  <Button asChild>
                    <Link to="/signature-validator" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      New Petition
                    </Link>
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading petitions...</p>
                  </div>
                ) : petitions.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FileSignature className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No petitions yet</h2>
                    <p className="text-muted-foreground mb-6">
                      You haven't saved any petitions yet. Upload a petition page to get started.
                    </p>
                    <Button asChild>
                      <Link to="/signature-validator" className="inline-flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Upload Petition Page
                      </Link>
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Petition Name</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Signatures</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {petitions.map((petition) => {
                            const progressPercent = petition.required_signatures > 0
                              ? Math.min(100, Math.round((petition.valid_signatures / petition.required_signatures) * 100))
                              : 0;
                            
                            return (
                              <TableRow key={petition.id}>
                                <TableCell className="font-medium">{petition.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{petition.district}</Badge>
                                  {petition.party && (
                                    <Badge variant="secondary" className="ml-2">{petition.party}</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1 w-[200px]">
                                    <div className="flex justify-between text-xs">
                                      <span>Signature Goal: {petition.required_signatures}</span>
                                      <span>{petition.valid_signatures} valid ({progressPercent}%)</span>
                                    </div>
                                    <Progress value={progressPercent} className="h-2" />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="text-sm">
                                      <span className="text-green-600">{petition.valid_signatures} valid</span>
                                      {' • '}
                                      <span className="text-red-600">{petition.invalid_signatures} invalid</span>
                                      {' • '}
                                      <span className="text-yellow-600">{petition.uncertain_signatures} uncertain</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {petition.total_pages} pages processed
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {new Date(petition.updated_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" asChild size="sm">
                                    <Link to={`/petitions/${petition.id}`}>View Details</Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
