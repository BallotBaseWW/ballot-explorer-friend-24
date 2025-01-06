import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Search from "./pages/Search";
import Lists from "./pages/Lists";
import Admin from "./pages/Admin";
import { ListDetails } from "./components/search/voter-lists/ListDetails";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/lists/:id" element={<ListDetails />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;