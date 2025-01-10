import { useParams } from "react-router-dom";
import { SearchInterface } from "@/components/SearchInterface";
import { Header } from "@/components/Header";
import { County } from "@/components/search/types";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Search = () => {
  const { county } = useParams<{ county: string }>();

  // Validate that the county param matches our County type
  const validCounty = (county || "") as County;

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <Header />
            <main className="max-w-7xl mx-auto p-4">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">
                  Searching in {county?.charAt(0).toUpperCase() + county?.slice(1)}
                </h2>
              </div>
              <SearchInterface county={validCounty} />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Search;