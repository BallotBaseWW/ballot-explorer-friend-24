import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MatchingFundsCalculator } from "@/components/matching-funds/MatchingFundsCalculator";

const MatchingFunds = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <MatchingFundsCalculator />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MatchingFunds;