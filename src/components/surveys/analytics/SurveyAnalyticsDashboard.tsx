import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsesTable } from "./ResponsesTable";
import { ResponsesChart } from "./ResponsesChart";
import { CompletionStats } from "./CompletionStats";
import { Loader2 } from "lucide-react";

interface SurveyAnalyticsDashboardProps {
  surveyId: string;
}

export const SurveyAnalyticsDashboard = ({ surveyId }: SurveyAnalyticsDashboardProps) => {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["survey-analytics", surveyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_analytics")
        .select("*")
        .eq("survey_id", surveyId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: responses, isLoading: responsesLoading } = useQuery({
    queryKey: ["survey-responses", surveyId],
    queryFn: async () => {
      const { data: surveyResponses, error: responsesError } = await supabase
        .from("survey_responses")
        .select(`
          *,
          survey_questions (
            question,
            question_type,
            options
          )
        `)
        .eq("survey_id", surveyId);

      if (responsesError) throw responsesError;

      return surveyResponses;
    },
  });

  if (analyticsLoading || responsesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CompletionStats analytics={analytics} />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <ResponsesChart responses={responses || []} />
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card className="p-6">
            <ResponsesTable responses={responses || []} />
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <Card className="p-6">
            <ResponsesChart responses={responses || []} showDetailed />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};