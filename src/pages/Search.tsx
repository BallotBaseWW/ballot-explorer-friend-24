
import { useParams } from "react-router-dom";
import { SearchInterface } from "@/components/SearchInterface";
import { County } from "@/components/search/types";
import { CountySwitcher } from "@/components/CountySwitcher";
import { useIsMobile } from "@/hooks/use-mobile";

const formatCountyName = (county: string): string => {
  if (county === "statenisland") return "Staten Island";
  return county.charAt(0).toUpperCase() + county.slice(1);
};

const Search = () => {
  const { county } = useParams<{ county: string }>();
  const validCounty = (county || "") as County;
  const isMobile = useIsMobile();

  return (
    <div className="w-full p-4">
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between items-start gap-4 mb-6`}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Voter Search</h1>
          <p className="text-muted-foreground">
            Searching in {formatCountyName(county || 'bronx')}
          </p>
        </div>
        <div className="mt-2 md:mt-0 w-full md:w-auto">
          <CountySwitcher currentCounty={validCounty} />
        </div>
      </div>
      <SearchInterface county={validCounty} />
    </div>
  );
};

export default Search;
