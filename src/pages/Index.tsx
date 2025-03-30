
import { CountySelector } from "@/components/CountySelector";
import { SiteUpdates } from "@/components/SiteUpdates";

const Index = () => {
  return (
    <div className="space-y-8 pt-2 md:pt-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
            Start Your Search
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select a county to begin searching for voter information
        </p>
      </div>
      
      <CountySelector />
      
      <div className="mt-12">
        <SiteUpdates />
      </div>
      
      <footer className="py-6 mt-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} BallotBase. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
