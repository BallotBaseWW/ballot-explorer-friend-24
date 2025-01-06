import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Search from "@/pages/Search";
import Lists from "@/pages/Lists";
import ListDetails from "@/pages/ListDetails";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import RequestAccess from "@/pages/RequestAccess";
import { AuthContainer } from "@/components/auth/AuthContainer";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/request-access" element={<RequestAccess />} />
          <Route path="/login" element={<Login />} />
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
            path="/admin"
            element={
              <AuthContainer adminOnly>
                <Admin />
              </AuthContainer>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;