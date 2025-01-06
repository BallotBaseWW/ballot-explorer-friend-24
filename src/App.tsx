import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RequestAccessForm from "./components/auth/RequestAccessForm";
import { Toaster } from "@/components/ui/toaster";
import { AuthContainer } from "@/components/auth/AuthContainer";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Navbar from "./components/layout/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/request-access" element={<RequestAccessForm />} />
        <Route
          path="/"
          element={
            <AuthContainer>
              <Home />
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
        <Route
          path="/profile"
          element={
            <AuthContainer>
              <Profile />
            </AuthContainer>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;