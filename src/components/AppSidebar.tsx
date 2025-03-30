import { useState } from "react";
import {
  FileSignature,
  LayoutDashboard,
  ListChecks,
  ListPlus,
  Search,
  ClipboardList,
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
import { useSidebar } from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function AppSidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const { user, session, isLoading } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-gray-50 border-r shadow-sm`}
    >
      <div className="flex-1 flex flex-col space-y-1">
        <Link to="/" className="flex-1">
          <div className="px-3 py-2 flex items-center justify-center">
            <h1 className="font-bold text-xl">NYVotes</h1>
          </div>
        </Link>
        <nav className="flex flex-col space-y-1">
          <NavItem icon={<LayoutDashboard />} to="/">
            Dashboard
          </NavItem>
          <NavItem icon={<Search />} to="/search">
            Voter Search
          </NavItem>
          <NavItem icon={<ListPlus />} to="/voter-lists">
            Voter Lists
          </NavItem>
          <NavItem icon={<FileSignature />} to="/signature-validator">Signature Validator</NavItem>
          <NavItem icon={<ClipboardList />} to="/petitions">My Petitions</NavItem>
          <NavItem icon={<ListChecks />} to="/surveys">
            Surveys
          </NavItem>
        </nav>
      </div>
      <div className="p-3 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-full items-center justify-between rounded-md"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.user_metadata?.name?.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{user?.user_metadata?.name}</span>
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
  );
}
