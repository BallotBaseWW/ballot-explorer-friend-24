import {
  BrowserRouter,
  Routes,
  Route,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import Search from "./pages/Search";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import { Toaster } from "@/components/ui/toaster";
import VoterList from "./pages/VoterList";
import Survey from "./pages/Survey";
import DesignatingPetition from "./pages/DesignatingPetition";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ballotbase-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

// Define routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/search/:county",
    element: <Search />,
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/voter-list/:id",
    element: <VoterList />,
  },
  {
    path: "/survey/:listId",
    element: <Survey />,
  },
  {
    path: "/petitions",
    element: <DesignatingPetition />,
  },
]);

export default App;
