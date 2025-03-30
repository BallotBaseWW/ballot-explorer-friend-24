
import { MatchingFundsCalculator } from "@/components/matching-funds/MatchingFundsCalculator";

const MatchingFunds = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Matching Funds Calculator</h1>
      <p className="text-muted-foreground mb-6">
        Calculate potential matching funds for your campaign based on qualifying contributions.
      </p>
      <MatchingFundsCalculator />
    </div>
  );
};

export default MatchingFunds;
