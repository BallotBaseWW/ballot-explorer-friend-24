
import { MatchingFundsCalculator } from "@/components/matching-funds/MatchingFundsCalculator";

const MatchingFunds = () => {
  return (
    <div className="w-full py-6 px-4 md:px-6 pb-16 mb-8">
      <div className="mt-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Matching Funds Calculator</h1>
        <p className="text-muted-foreground mt-1">
          Calculate potential matching funds for your campaign based on qualifying contributions.
        </p>
      </div>
      <MatchingFundsCalculator />
    </div>
  );
};

export default MatchingFunds;
