import { Progress } from "@/components/ui/progress";

interface SurveyProgressProps {
  totalVoters: number;
  completedVoters: number;
}

export const SurveyProgress = ({ totalVoters, completedVoters }: SurveyProgressProps) => {
  const progressPercentage = totalVoters > 0 
    ? Math.round((completedVoters / totalVoters) * 100)
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Survey Progress</span>
        <span>{completedVoters} of {totalVoters} voters surveyed ({progressPercentage}%)</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};