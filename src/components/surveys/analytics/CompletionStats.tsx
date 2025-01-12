import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CompletionStatsProps {
  analytics: {
    total_voters: number;
    total_responses: number;
    completion_rate: number;
  } | null;
}

export const CompletionStats = ({ analytics }: CompletionStatsProps) => {
  if (!analytics) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground">Total Voters</h3>
        <p className="mt-2 text-3xl font-bold">{analytics.total_voters}</p>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground">Responses</h3>
        <p className="mt-2 text-3xl font-bold">{analytics.total_responses}</p>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground">Completion Rate</h3>
        <p className="mt-2 text-3xl font-bold">{analytics.completion_rate}%</p>
        <Progress value={analytics.completion_rate} className="mt-2" />
      </Card>
    </div>
  );
};