
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SiteUpdates } from "@/components/SiteUpdates";
import { Hero } from "@/components/Hero";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <Header />
            <main className="container mx-auto p-4">
              <Hero />
              <div className="mt-8">
                <SiteUpdates />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Home;
