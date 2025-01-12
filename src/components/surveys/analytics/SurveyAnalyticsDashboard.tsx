import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsesTable } from "./ResponsesTable";
import { ResponsesChart } from "./ResponsesChart";
import { CompletionStats } from "./CompletionStats";
import { Loader2 } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

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
        .maybeSingle();

      if (error) {
        console.error("Error fetching analytics:", error);
        throw error;
      }

      // Return default values if no data found
      return data || {
        total_voters: 0,
        total_responses: 0,
        completion_rate: 0,
        survey_id: surveyId,
      };
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

      if (responsesError) {
        console.error("Error fetching responses:", responsesError);
        throw responsesError;
      }

      // Transform the responses to match the expected format
      return surveyResponses?.map(response => ({
        ...response,
        survey_questions: {
          ...response.survey_questions,
          options: Array.isArray(response.survey_questions.options) 
            ? response.survey_questions.options.map(opt => String(opt))
            : undefined
        }
      })) || [];
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