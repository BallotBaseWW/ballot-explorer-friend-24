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
import { SurveyProgress } from "@/components/surveys/SurveyProgress";
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

  // Add a new query to fetch existing responses for the selected voter
  const { data: existingResponses } = useQuery({
    queryKey: ["voter-responses", id, selectedVoter?.state_voter_id],
    queryFn: async () => {
      if (!selectedVoter) return null;

      const { data, error } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("survey_id", id)
        .eq("state_voter_id", selectedVoter.state_voter_id);

      if (error) throw error;
      console.log("Existing responses for voter:", data);
      return data;
    },
    enabled: !!selectedVoter,
  });

  const { data: surveyAnalytics } = useQuery({
    queryKey: ["survey-analytics", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_analytics")
        .select("*")
        .eq("survey_id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: survey } = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*, voter_lists(*)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      console.log("Survey data:", data);
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
      console.log("Questions data:", data);
      return data;
    },
  });

  const submitResponse = useMutation({
    mutationFn: async (response: string) => {
      const currentQuestion = questions?.[currentQuestionIndex];
      if (!currentQuestion || !selectedVoter || !selectedCounty) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log("Submitting response for voter:", {
        voterId: selectedVoter.state_voter_id,
        county: selectedCounty,
        questionId: currentQuestion.id,
        response
      });

      // Insert the response
      const { error: responseError } = await supabase
        .from("survey_responses")
        .insert({
          survey_id: id,
          question_id: currentQuestion.id,
          response,
          state_voter_id: selectedVoter.state_voter_id,
          county: selectedCounty,
          created_by: user.id
        });

      if (responseError) {
        console.error("Error submitting response:", responseError);
        throw responseError;
      }

      // Check if this was the last question
      if (currentQuestionIndex === questions.length - 1) {
        console.log("Updating survey status for voter:", selectedVoter.state_voter_id);
        
        // Update the voter's survey status to completed
        const { error: statusError } = await supabase
          .from("voter_list_items")
          .update({ survey_status: "completed" })
          .eq("list_id", survey?.assigned_list_id)
          .eq("state_voter_id", selectedVoter.state_voter_id);

        if (statusError) {
          console.error("Error updating survey status:", statusError);
          throw statusError;
        }
        
        console.log("Successfully marked voter as completed");
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["survey-responses"] });
      queryClient.invalidateQueries({ queryKey: ["survey-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["voter-list-items"] });
      queryClient.invalidateQueries({ queryKey: ["voter-responses"] });
      
      if (questions && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        toast({
          title: "Survey completed",
          description: "Thank you for your responses!",
        });
        setCurrentQuestionIndex(0);
        setSelectedVoter(null);
        setSelectedCounty(null);
      }
    },
    onError: (error) => {
      console.error("Error submitting response:", error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVoterSelect = (voter: any, county: County) => {
    // Check if voter has already completed the survey
    if (voter.survey_status === 'completed') {
      toast({
        title: "Voter already surveyed",
        description: "This voter has already completed the survey.",
        variant: "destructive",
      });
      return;
    }
    setSelectedVoter(voter);
    setSelectedCounty(county);
    setCurrentQuestionIndex(0); // Reset to first question when selecting a new voter
  };

  if (!survey || !questions) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

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
              {surveyAnalytics && (
                <div className="mt-4">
                  <SurveyProgress 
                    totalVoters={surveyAnalytics.total_voters || 0}
                    completedVoters={surveyAnalytics.total_responses || 0}
                  />
                </div>
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