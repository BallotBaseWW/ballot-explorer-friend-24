
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
import { AuthContainer } from "@/components/auth/AuthContainer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const queryClient = new QueryClient();

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
                  <Index />
                </AuthContainer>
              }
            />
            <Route
              path="/search/:county"
              element={
                <AuthContainer>
                  <Search />
                </AuthContainer>
              }
            />
            <Route
              path="/lists"
              element={
                <AuthContainer>
                  <Lists />
                </AuthContainer>
              }
            />
            <Route
              path="/lists/:id"
              element={
                <AuthContainer>
                  <ListDetails />
                </AuthContainer>
              }
            />
            <Route
              path="/matching-funds"
              element={
                <AuthContainer>
                  <MatchingFunds />
                </AuthContainer>
              }
            />
            <Route
              path="/districts"
              element={
                <AuthContainer>
                  <Districts />
                </AuthContainer>
              }
            />
            <Route
              path="/surveys"
              element={
                <AuthContainer>
                  <Surveys />
                </AuthContainer>
              }
            />
            <Route
              path="/surveys/:id"
              element={
                <AuthContainer>
                  <SurveyDetails />
                </AuthContainer>
              }
            />
            <Route
              path="/surveys/:id/respond"
              element={
                <AuthContainer>
                  <SurveyResponse />
                </AuthContainer>
              }
            />
            <Route
              path="/designating-petition"
              element={
                <AuthContainer>
                  <DesignatingPetition />
                </AuthContainer>
              }
            />
            <Route
              path="/admin"
              element={
                <AuthContainer adminOnly>
                  <Admin />
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
