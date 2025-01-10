import { useParams } from "react-router-dom";
import { SearchInterface } from "@/components/SearchInterface";
import { Header } from "@/components/Header";
import { County } from "@/components/search/types";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CountySwitcher } from "@/components/CountySwitcher";

const formatCountyName = (county: string): string => {
  if (county === "statenisland") return "Staten Island";
  return county.charAt(0).toUpperCase() + county.slice(1);
};

const Search = () => {
  const { county } = useParams<{ county: string }>();
  const validCounty = (county || "") as County;

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <Header />
            <main className="max-w-7xl mx-auto p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Searching in {formatCountyName(county || '')}
                </h2>
                <CountySwitcher currentCounty={validCounty} />
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