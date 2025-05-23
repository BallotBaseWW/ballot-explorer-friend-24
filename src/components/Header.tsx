// This file is now obsolete as we're using the AppSidebar for navigation
// We're keeping the file for now but it's no longer being used in the application
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, UserPlus, Home, Search, ListTodo, FileText, Shield, ClipboardList, ScanText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useState } from "react";
import { ThemeToggle } from "./theme/ThemeToggle";
import { useQuery } from "@tanstack/react-query";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { data: isAdmin } = useQuery({
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
  });

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

  const navigationItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: ListTodo, label: "Lists", path: "/voter-lists" },
    { icon: ClipboardList, label: "Surveys", path: "/surveys" },
    { icon: ScanText, label: "Signature Validator", path: "/signature-validator" },
    { icon: FileText, label: "Resources", path: "/resources" },
  ];

  if (isAdmin) {
    navigationItems.push({ icon: Shield, label: "Admin", path: "/admin" });
  }

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
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={handleNavigate(item.path)}
              className="flex items-center gap-2"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
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
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="transition-colors hover:bg-accent data-[state=open]:bg-accent"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                className="w-56 animate-in fade-in-0 zoom-in-95"
              >
                {/* Mobile Navigation Items */}
                <div className="md:hidden">
                  {navigationItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={handleNavigate(item.path)}
                      className="cursor-pointer"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </div>
                
                {/* Logout Option (visible on all screen sizes) */}
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer transition-colors hover:bg-destructive hover:text-destructive-foreground"
                >
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
