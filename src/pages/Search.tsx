
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Searching in {formatCountyName(county || '')}
        </h2>
        <CountySwitcher currentCounty={validCounty} />
      </div>
      <SearchInterface county={validCounty} />
    </div>
  );
};

export default Search;
