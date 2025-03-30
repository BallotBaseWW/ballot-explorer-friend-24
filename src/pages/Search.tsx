
import { useParams } from "react-router-dom";
import { SearchInterface } from "@/components/SearchInterface";
import { County } from "@/components/search/types";
import { CountySwitcher } from "@/components/CountySwitcher";

const formatCountyName = (county: string): string => {
  if (county === "statenisland") return "Staten Island";
  return county.charAt(0).toUpperCase() + county.slice(1);
};

const Search = () => {
  const { county } = useParams<{ county: string }>();
  const validCounty = (county || "") as County;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Voter Search</h1>
          <p className="text-muted-foreground">
            Searching in {formatCountyName(county || 'bronx')}
          </p>
        </div>
        <CountySwitcher currentCounty={validCounty} />
      </div>
      <SearchInterface county={validCounty} />
    </div>
  );
};

export default Search;
