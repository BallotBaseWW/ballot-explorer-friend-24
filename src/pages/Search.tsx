import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchInterface } from "@/components/SearchInterface";

const Search = () => {
  const { county } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="p-4 md:p-6 border-b">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-primary"
          >
            ← Back to County Selection
          </Button>
          <div className="text-xl font-semibold">
            Searching in {county?.charAt(0).toUpperCase() + county?.slice(1)}
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto p-4">
        <SearchInterface county={county || ""} />
      </main>
    </div>
  );
};

export default Search;