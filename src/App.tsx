
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Search from "@/pages/Search";
import Lists from "@/pages/Lists";
import ListDetails from "@/pages/ListDetails";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import RequestAccess from "@/pages/RequestAccess";
import MatchingFunds from "@/pages/MatchingFunds";
import Districts from "@/pages/Districts";
import Surveys from "@/pages/Surveys";
import SurveyDetails from "@/pages/SurveyDetails";
import SurveyResponse from "@/pages/SurveyResponse";
import DesignatingPetition from "@/pages/DesignatingPetition";
import SignatureValidator from "@/pages/SignatureValidator";
import Petitions from "@/pages/Petitions";
import PetitionDetail from "@/pages/PetitionDetail";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

// Layout component to wrap authenticated routes
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 ml-16 md:ml-64">
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ballotbase-theme">
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/request-access" element={<RequestAccess />} />
              <Route
                path="/"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <Index />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route
                path="/search/:county"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <Search />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route
                path="/search"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <Search />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route
                path="/voter-lists"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <Lists />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route
                path="/lists/:id"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <ListDetails />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route
                path="/matching-funds"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <MatchingFunds />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route
                path="/districts"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <Districts />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route
                path="/surveys"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <Surveys />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route
                path="/surveys/:id"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <SurveyDetails />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route
                path="/surveys/:id/respond"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <SurveyResponse />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route
                path="/designating-petition"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <DesignatingPetition />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route
                path="/admin"
                element={
                  <AuthContainer adminOnly>
                    <AppLayout>
                      <Admin />
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route 
                path="/signature-validator" 
                element={
                  <AuthContainer>
                    <AppLayout>
                      <SignatureValidator />
                    </AppLayout>
                  </AuthContainer>
                } 
              />
              <Route 
                path="/petitions" 
                element={
                  <AuthContainer>
                    <AppLayout>
                      <Petitions />
                    </AppLayout>
                  </AuthContainer>
                } 
              />
              <Route 
                path="/petitions/:id" 
                element={
                  <AuthContainer>
                    <AppLayout>
                      <PetitionDetail />
                    </AppLayout>
                  </AuthContainer>
                } 
              />
              <Route
                path="/resources"
                element={
                  <AuthContainer>
                    <AppLayout>
                      <div>
                        <h1 className="text-3xl font-bold mb-6">Resources</h1>
                        <p className="text-muted-foreground">Resources will be available here.</p>
                      </div>
                    </AppLayout>
                  </AuthContainer>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
