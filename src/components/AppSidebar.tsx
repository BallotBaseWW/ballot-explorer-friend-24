
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileSignature,
  LayoutDashboard,
  ListChecks,
  ListPlus,
  Search,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
} from "lucide-react";
import { NavItem } from "@/components/ui/nav-item";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isLoading } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Collapsible 
      open={!collapsed} 
      onOpenChange={(open) => setCollapsed(!open)}
      className={cn(
        "h-screen fixed left-0 top-0 z-20 bg-gray-50 border-r shadow-sm transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <Link to="/" className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
            <h1 className={cn("font-bold", collapsed ? "text-lg" : "text-xl")}>
              <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
                {collapsed ? "BB" : "BallotBase"}
              </span>
            </h1>
          </Link>
          
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className={cn("", collapsed ? "hidden" : "ml-auto")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>

        {collapsed && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCollapsed(false)}
            className="mt-2 mx-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 flex flex-col space-y-1 p-2">
            {!collapsed && (
              <>
                <NavItem icon={<LayoutDashboard />} to="/">
                  Dashboard
                </NavItem>
                <NavItem icon={<Search />} to="/search">
                  Voter Search
                </NavItem>
                <NavItem icon={<ListPlus />} to="/voter-lists">
                  Voter Lists
                </NavItem>
                <NavItem icon={<FileSignature />} to="/signature-validator">
                  Signature Validator
                </NavItem>
                <NavItem icon={<ClipboardList />} to="/petitions">
                  My Petitions
                </NavItem>
                <NavItem icon={<ListChecks />} to="/surveys">
                  Surveys
                </NavItem>
                <NavItem icon={<FileText />} to="/resources">
                  Resources
                </NavItem>
                {isAdmin && (
                  <NavItem icon={<Shield />} to="/admin">
                    Admin
                  </NavItem>
                )}
              </>
            )}

            {collapsed && (
              <>
                <NavItem
                  to="/"
                  className="justify-center"
                  icon={<LayoutDashboard />}
                />
                <NavItem
                  to="/search"
                  className="justify-center"
                  icon={<Search />}
                />
                <NavItem
                  to="/voter-lists"
                  className="justify-center"
                  icon={<ListPlus />}
                />
                <NavItem
                  to="/signature-validator"
                  className="justify-center"
                  icon={<FileSignature />}
                />
                <NavItem
                  to="/petitions"
                  className="justify-center"
                  icon={<ClipboardList />}
                />
                <NavItem
                  to="/surveys"
                  className="justify-center"
                  icon={<ListChecks />}
                />
                <NavItem
                  to="/resources"
                  className="justify-center"
                  icon={<FileText />}
                />
                {isAdmin && (
                  <NavItem
                    to="/admin"
                    className="justify-center"
                    icon={<Shield />}
                  />
                )}
              </>
            )}
          </nav>
        </div>

        <div className="p-3 border-t mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-8 w-full rounded-md",
                  collapsed ? "justify-center" : "justify-between"
                )}
              >
                <div className={cn("flex items-center", collapsed ? "gap-0" : "gap-2")}>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user?.user_metadata?.name?.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && <span className="text-sm">{user?.user_metadata?.name}</span>}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <DropdownMenuItem>
                <Link to="/account" className="w-full">
                  My Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? "Logging Out..." : "Log Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Collapsible>
  );
}
