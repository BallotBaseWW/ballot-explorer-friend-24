import { Hero } from "@/components/Hero";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 md:p-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xl font-semibold text-primary">BB</div>
          <button
            onClick={() => {
              toast({
                title: "Supabase Connection Required",
                description: "Please connect Supabase to enable search functionality.",
              });
            }}
            className="px-4 py-2 rounded-full bg-secondary text-white hover:bg-secondary/90 transition-colors"
          >
            Connect Database
          </button>
        </nav>
      </header>
      <main>
        <Hero />
      </main>
      <footer className="py-8 text-center text-neutral text-sm">
        <p>© 2024 BallotBase. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;