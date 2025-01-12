import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UserNav } from "@/components/auth/UserNav";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <SidebarTrigger className="mr-2" />
        
        <div className="mr-4 hidden md:flex">
          <Button
            variant="link"
            className="font-bold"
            onClick={() => navigate("/")}
          >
            <span className="text-primary">Matching</span>
            <span className="text-rose-500">Funds</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}