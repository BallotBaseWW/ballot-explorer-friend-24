import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Home, LogOut, Shield, ListTodo, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { ThemeToggle } from "./theme/ThemeToggle";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: isAdmin, isError } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;
      
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return false;
      }
      
      return roleData?.role === "admin";
    },
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Logged out successfully",
      duration: 2000,
    });
    navigate("/login");
  }, [navigate, toast]);

  const handleNavigate = useCallback((path: string) => () => {
    navigate(path);
  }, [navigate]);

  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          className="text-2xl font-bold cursor-pointer"
          onClick={handleNavigate("/")}
        >
          <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
            BallotBase
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNavigate("/")}
            className="hidden md:flex"
          >
            <Home className="h-5 w-5" />
          </Button>
          
          {!isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigate("/request-access")}
              className="hidden md:flex"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
          )}
          
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleNavigate("/")}>
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleNavigate("/lists")}>
                  <ListTodo className="mr-2 h-4 w-4" />
                  My Lists
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={handleNavigate("/admin")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};