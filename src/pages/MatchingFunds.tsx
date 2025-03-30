
import { MatchingFundsCalculator } from "@/components/matching-funds/MatchingFundsCalculator";

const MatchingFunds = () => {
  return (
    <div className="w-full p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Matching Funds Calculator</h1>
      <p className="text-muted-foreground mb-6">
        Calculate potential matching funds for your campaign based on qualifying contributions.
      </p>
      <MatchingFundsCalculator />
    </div>
  );
};

export default MatchingFunds;
