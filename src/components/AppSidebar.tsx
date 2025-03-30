
import { useState, useEffect } from "react";
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
  Menu,
  X
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on mobile by window width
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Navigation items shared between desktop and mobile
  const navigationItems = [
    { to: "/", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
    { to: "/search", icon: <Search className="h-4 w-4" />, label: "Voter Search" },
    { to: "/voter-lists", icon: <ListPlus className="h-4 w-4" />, label: "Voter Lists" },
    { to: "/signature-validator", icon: <FileSignature className="h-4 w-4" />, label: "Signature Validator" },
    { to: "/petitions", icon: <ClipboardList className="h-4 w-4" />, label: "My Petitions" },
    { to: "/surveys", icon: <ListChecks className="h-4 w-4" />, label: "Surveys" },
    { to: "/resources", icon: <FileText className="h-4 w-4" />, label: "Resources" },
  ];
  
  if (isAdmin) {
    navigationItems.push({ to: "/admin", icon: <Shield className="h-4 w-4" />, label: "Admin" });
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Desktop sidebar
  const DesktopSidebar = () => (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <Link to="/" className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
          <h1 className={cn("font-bold", collapsed ? "text-lg" : "text-xl")}>
            <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
              {collapsed ? "BB" : "BallotBase"}
            </span>
          </h1>
        </Link>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn("", collapsed ? "hidden" : "ml-auto")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
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

      <div className="flex-1 overflow-y-auto py-2 px-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              active={isActive(item.to)}
              icon={item.icon}
              className={collapsed ? "justify-center" : ""}
            >
              {!collapsed && item.label}
            </NavItem>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-10 w-full rounded-md flex items-center",
                collapsed ? "justify-center" : "justify-between"
              )}
            >
              <div className={cn("flex items-center", collapsed ? "gap-0" : "gap-2")}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="User avatar" />
                  <AvatarFallback>
                    {(user?.user_metadata?.name?.slice(0, 1) || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <span className="ml-2 text-sm font-medium truncate">
                    {user?.user_metadata?.name || "User"}
                  </span>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
    </aside>
  );

  // Mobile sidebar with Sheet component
  const MobileSidebar = () => (
    <>
      <div className="fixed top-0 left-0 right-0 h-14 z-20 border-b bg-background flex items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <h1 className="font-bold text-xl">
            <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
              BallotBase
            </span>
          </h1>
        </Link>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 max-w-[250px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <Link to="/" className="flex items-center">
                  <h1 className="font-bold text-xl">
                    <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
                      BallotBase
                    </span>
                  </h1>
                </Link>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4 px-2">
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <NavItem
                      key={item.to}
                      to={item.to}
                      active={isActive(item.to)}
                      icon={item.icon}
                    >
                      {item.label}
                    </NavItem>
                  ))}
                </nav>
              </div>
              
              <div className="p-3 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt="User avatar" />
                    <AvatarFallback>
                      {(user?.user_metadata?.name?.slice(0, 1) || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {user?.user_metadata?.name || "User"}
                  </span>
                </div>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/account">My Account</Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start mt-2" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Logging Out..." : "Log Out"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );

  return (
    <>
      {isMobile ? (
        <MobileSidebar />
      ) : (
        <DesktopSidebar />
      )}
    </>
  );
}
