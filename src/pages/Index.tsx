import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 md:p-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xl font-semibold text-primary">BB</div>
          <div className="flex gap-4 items-center">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4">
        <Hero />
      </main>
      <footer className="py-8 text-center text-neutral text-sm">
        <p>© 2024 BallotBase. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;