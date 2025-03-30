import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
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

const queryClient = new QueryClient();

// Layout component to wrap authenticated routes
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <main className="flex-1 ml-16">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ballotbase-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/request-access" element={<RequestAccess />} />
            <Route
              path="/"
              element={
                <AuthContainer>
                  <AppLayout>
                    <div className="max-w-7xl mx-auto px-4 py-8">
                      <div className="text-center mb-12 pt-12">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                          <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
                            Start Your Search
                          </span>
                        </h1>
                      </div>
                      <CountySelector />
                      <SiteUpdates />
                    </div>
                    <footer className="py-8 text-center text-foreground/60 text-sm">
                      <p>© 2024 BallotBase. All rights reserved.</p>
                    </footer>
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
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
