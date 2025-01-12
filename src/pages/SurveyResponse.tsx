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
import { VoterSelectionStep } from "@/components/surveys/VoterSelectionStep";
import { Json } from "@/integrations/supabase/types";
import { County } from "@/components/search/types";

const SurveyResponse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedVoter, setSelectedVoter] = useState<any>(null);
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const queryClient = useQueryClient();

  const { data: survey } = useQuery({
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

  const { data: questions } = useQuery({
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
      if (!currentQuestion || !selectedVoter) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      // Save the response
      const { error: responseError } = await supabase.from("survey_responses").insert({
        survey_id: id,
        question_id: currentQuestion.id,
        response,
        state_voter_id: selectedVoter.state_voter_id,
        county: selectedCounty,
        created_by: user.id
      });

      if (responseError) throw responseError;

      // If this is the last question, update the voter's survey status
      if (currentQuestionIndex === questions.length - 1) {
        const { error: statusError } = await supabase
          .from("voter_list_items")
          .update({ survey_status: "completed" })
          .eq("list_id", survey?.assigned_list_id)
          .eq("state_voter_id", selectedVoter.state_voter_id);

        if (statusError) throw statusError;
      }
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
        // Reset state and go back to voter selection
        setCurrentQuestionIndex(0);
        setSelectedVoter(null);
        setSelectedCounty(null);
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

  const handleVoterSelect = (voter: any, county: County) => {
    setSelectedVoter(voter);
    setSelectedCounty(county);
  };

  if (!survey || !questions) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

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
              <h1 className="text-3xl font-bold">{survey.title}</h1>
              {survey.description && (
                <p className="text-muted-foreground mt-2">{survey.description}</p>
              )}
            </div>

            {!selectedVoter ? (
              <VoterSelectionStep
                listId={survey.assigned_list_id}
                onVoterSelect={handleVoterSelect}
              />
            ) : (
              formattedQuestion && (
                <Card className="p-6">
                  <div className="mb-6">
                    <h3 className="font-medium text-muted-foreground">
                      Currently surveying: {selectedVoter.first_name} {selectedVoter.last_name}
                    </h3>
                  </div>
                  <SurveyResponseForm
                    question={formattedQuestion}
                    onSubmit={(response) => submitResponse.mutate(response)}
                    onBack={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    isFirst={currentQuestionIndex === 0}
                    isLast={currentQuestionIndex === questions.length - 1}
                  />
                </Card>
              )
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SurveyResponse;