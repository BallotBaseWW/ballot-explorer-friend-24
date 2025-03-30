
import { CountySelector } from "@/components/CountySelector";
import { SiteUpdates } from "@/components/SiteUpdates";

const Index = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12 pt-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
            Start Your Search
          </span>
        </h1>
      </div>
      <CountySelector />
      <SiteUpdates />
      <footer className="py-8 text-center text-foreground/60 text-sm">
        <p>© 2024 BallotBase. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
