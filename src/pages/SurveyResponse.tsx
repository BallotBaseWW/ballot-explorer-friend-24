import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SurveyResponseForm } from "@/components/surveys/SurveyResponseForm";
import { Json } from "@/integrations/supabase/types";

const SurveyResponse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const queryClient = useQueryClient();

  const { data: survey, isLoading: surveyLoading } = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ["survey-questions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_questions")
        .select("*")
        .eq("survey_id", id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

  const submitResponse = useMutation({
    mutationFn: async (response: string) => {
      const currentQuestion = questions?.[currentQuestionIndex];
      if (!currentQuestion) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("survey_responses").insert({
        survey_id: id,
        question_id: currentQuestion.id,
        response,
        state_voter_id: "temp", // This will need to be updated with actual voter ID
        county: "temp", // This will need to be updated with actual county
        created_by: user.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-responses"] });
      
      if (questions && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        toast({
          title: "Survey completed",
          description: "Thank you for your responses!",
        });
        navigate(`/surveys/${id}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (surveyLoading || questionsLoading) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions?.[currentQuestionIndex];

  // Transform the question to match the expected type
  const formattedQuestion = currentQuestion ? {
    id: currentQuestion.id,
    question: currentQuestion.question,
    question_type: currentQuestion.question_type,
    options: Array.isArray(currentQuestion.options) 
      ? (currentQuestion.options as Json[]).map(opt => String(opt))
      : undefined
  } : null;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="max-w-3xl mx-auto px-4 py-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate(`/surveys/${id}`)}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Survey
            </Button>

            <div className="mb-8">
              <h1 className="text-3xl font-bold">{survey?.title}</h1>
              {survey?.description && (
                <p className="text-muted-foreground mt-2">{survey.description}</p>
              )}
              <div className="text-sm text-muted-foreground mt-2">
                Question {currentQuestionIndex + 1} of {questions?.length}
              </div>
            </div>

            {formattedQuestion && (
              <Card className="p-6">
                <SurveyResponseForm
                  question={formattedQuestion}
                  onSubmit={(response) => submitResponse.mutate(response)}
                  onBack={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  isFirst={currentQuestionIndex === 0}
                  isLast={currentQuestionIndex === (questions?.length ?? 0) - 1}
                />
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SurveyResponse;