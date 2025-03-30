
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPetitionById, getPetitionSignatures } from "@/components/signature-validator/petition-service";
import { PetitionProgress, SignatureValidation } from "@/components/signature-validator/types";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValidationResults } from "@/components/signature-validator/ValidationResults";
import { ArrowLeft, FileSignature, ListPlus, Printer } from "lucide-react";
import { AddToListDialog } from "@/components/search/voter-lists/AddToListDialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";

export default function PetitionDetail() {
  const { id } = useParams<{ id: string }>();
  const [petition, setPetition] = useState<PetitionProgress | null>(null);
  const [signatures, setSignatures] = useState<SignatureValidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagesWithSignatures, setPagesWithSignatures] = useState<number[]>([]);
  
  useEffect(() => {
    const loadPetition = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const petitionData = await getPetitionById(id);
        setPetition(petitionData);
        
        // Load all signatures to determine which pages have data
        const allSignatures = await getPetitionSignatures(id);
        
        // Get unique page numbers
        const uniquePages = Array.from(new Set(allSignatures.map(sig => sig.page_number || 1))).sort();
        setPagesWithSignatures(uniquePages);
        
        // Set first page as default
        if (uniquePages.length > 0) {
          setCurrentPage(uniquePages[0]);
          
          // Load signatures for the first page
          const pageSignatures = allSignatures.filter(sig => sig.page_number === uniquePages[0]);
          setSignatures(pageSignatures);
        }
      } catch (error) {
        console.error("Error loading petition details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPetition();
  }, [id]);
  
  const handlePageChange = async (page: number) => {
    if (!id) return;
    
    setCurrentPage(page);
    try {
      setIsLoading(true);
      const pageSignatures = await getPetitionSignatures(id, page);
      setSignatures(pageSignatures);
    } catch (error) {
      console.error(`Error loading signatures for page ${page}:`, error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignatureClick = (signature: SignatureValidation) => {
    setSelectedSignatureId(signature.id);
  };
  
  // Calculate stats for the current page
  const pageStats = {
    total: signatures.length,
    valid: signatures.filter(sig => sig.status === "valid").length,
    invalid: signatures.filter(sig => sig.status === "invalid").length,
    uncertain: signatures.filter(sig => sig.status === "uncertain").length
  };
  
  // Prepare data for adding valid voters to a list
  const validVoters = signatures
    .filter(sig => sig.status === "valid" && sig.matched_voter?.state_voter_id)
    .map(sig => ({
      state_voter_id: sig.matched_voter!.state_voter_id
    }));
  
  // Determine county from signatures (default to Staten Island)
  const county = signatures.length > 0 ? 
    signatures[0].address.toLowerCase().includes('staten island') ? 'statenisland' : 
    signatures[0].address.toLowerCase().includes('brooklyn') ? 'brooklyn' :
    signatures[0].address.toLowerCase().includes('bronx') ? 'bronx' :
    signatures[0].address.toLowerCase().includes('queens') ? 'queens' :
    signatures[0].address.toLowerCase().includes('manhattan') ? 'manhattan' : 
    'statenisland' : 'statenisland';
  
  if (isLoading && !petition) {
    return (
      <div className="min-h-screen bg-background">
        <SidebarProvider>
          <div className="flex w-full">
            <AppSidebar />
            <div className="flex-1 overflow-hidden">
              <Header />
              <main className="p-4 md:p-6 flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
                <div className="text-center">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading petition details...</p>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    );
  }
  
  if (!petition) {
    return (
      <div className="min-h-screen bg-background">
        <SidebarProvider>
          <div className="flex w-full">
            <AppSidebar />
            <div className="flex-1 overflow-hidden">
              <Header />
              <main className="p-4 md:p-6" style={{ height: 'calc(100vh - 64px)' }}>
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <Button asChild variant="outline" className="mb-4">
                      <Link to="/petitions" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Petitions
                      </Link>
                    </Button>
                    <h1 className="text-3xl font-bold mb-2">Petition Not Found</h1>
                    <p>The petition you're looking for doesn't exist or was deleted.</p>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    );
  }
  
  const progressPercent = petition.required_signatures > 0
    ? Math.min(100, Math.round((petition.valid_signatures / petition.required_signatures) * 100))
    : 0;
  
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <div className="flex-1 overflow-hidden">
            <Header />
            <main className="p-4 md:p-6 overflow-auto" style={{ height: 'calc(100vh - 64px)' }}>
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <Button asChild variant="outline" className="mb-4">
                    <Link to="/petitions" className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Petitions
                    </Link>
                  </Button>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl font-bold">{petition.name}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>District: {petition.district}</span>
                        {petition.party && (
                          <>
                            <span>•</span>
                            <span>Party: {petition.party}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => window.print()}
                      >
                        <Printer className="h-4 w-4" />
                        Print Report
                      </Button>
                      
                      {validVoters.length > 0 && (
                        <AddToListDialog 
                          voters={validVoters} 
                          county={county} 
                        />
                      )}
                      
                      <Button asChild>
                        <Link to="/signature-validator" className="flex items-center gap-2">
                          <FileSignature className="h-4 w-4" />
                          Add Page
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <Card className="p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Signature Goal</h3>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold">{petition.valid_signatures}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-lg">{petition.required_signatures}</span>
                          <span className="text-muted-foreground ml-1">valid signatures</span>
                        </div>
                        <div className="mt-2">
                          <Progress value={progressPercent} className="h-2" />
                          <div className="text-xs text-right mt-1">{progressPercent}% complete</div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Collection</h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm">{petition.valid_signatures} valid signatures</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm">{petition.invalid_signatures} invalid signatures</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-sm">{petition.uncertain_signatures} uncertain signatures</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Pages</h3>
                        <div className="text-2xl font-bold">{petition.total_pages}</div>
                        <div className="text-sm text-muted-foreground">
                          Last updated {new Date(petition.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="signatures">Signatures</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-6">
                    <Card className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Petition Progress</h2>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Signature Collection</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-md border">
                              <div className="text-2xl font-bold">{petition.total_signatures}</div>
                              <div className="text-sm text-muted-foreground">Total Signatures</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-md border border-green-100">
                              <div className="text-2xl font-bold text-green-600">{petition.valid_signatures}</div>
                              <div className="text-sm text-green-600">Valid</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-md border border-red-100">
                              <div className="text-2xl font-bold text-red-600">{petition.invalid_signatures}</div>
                              <div className="text-sm text-red-600">Invalid</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                              <div className="text-2xl font-bold text-yellow-600">{petition.uncertain_signatures}</div>
                              <div className="text-sm text-yellow-600">Uncertain</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Page History</h3>
                          {pagesWithSignatures.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b text-left">
                                    <th className="pb-2 font-medium">Page</th>
                                    <th className="pb-2 font-medium">Signatures</th>
                                    <th className="pb-2 font-medium">Valid</th>
                                    <th className="pb-2 font-medium">Invalid</th>
                                    <th className="pb-2 font-medium">Uncertain</th>
                                    <th className="pb-2 font-medium">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pagesWithSignatures.map(page => {
                                    const pageSignatures = signatures.filter(sig => sig.page_number === page);
                                    const pageValidCount = pageSignatures.filter(sig => sig.status === "valid").length;
                                    const pageInvalidCount = pageSignatures.filter(sig => sig.status === "invalid").length;
                                    const pageUncertainCount = pageSignatures.filter(sig => sig.status === "uncertain").length;
                                    
                                    return (
                                      <tr key={page} className="border-b">
                                        <td className="py-4">Page {page}</td>
                                        <td className="py-4">{pageSignatures.length}</td>
                                        <td className="py-4 text-green-600">{pageValidCount}</td>
                                        <td className="py-4 text-red-600">{pageInvalidCount}</td>
                                        <td className="py-4 text-yellow-600">{pageUncertainCount}</td>
                                        <td className="py-4">
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => {
                                              setActiveTab("signatures");
                                              handlePageChange(page);
                                            }}
                                          >
                                            View
                                          </Button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No page history available
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="signatures" className="mt-6">
                    <Card className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h2 className="text-xl font-semibold">Page {currentPage} Signatures</h2>
                        
                        {pagesWithSignatures.length > 1 && (
                          <Pagination>
                            <PaginationContent>
                              {pagesWithSignatures.map(page => (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    isActive={page === currentPage}
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                            </PaginationContent>
                          </Pagination>
                        )}
                      </div>
                      
                      {isLoading ? (
                        <div className="text-center py-12">
                          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p>Loading signatures...</p>
                        </div>
                      ) : signatures.length > 0 ? (
                        <ValidationResults 
                          signatures={signatures} 
                          stats={pageStats}
                          selectedSignatureId={selectedSignatureId}
                          onSignatureSelect={handleSignatureClick}
                        />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No signatures found for this page
                        </div>
                      )}
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
