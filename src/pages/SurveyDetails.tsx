import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusIcon, ArrowLeftIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AddQuestionDialog } from "@/components/surveys/AddQuestionDialog";
import { useState } from "react";

const SurveyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);

  const { data: survey, isLoading: surveyLoading } = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", id)
        .single();

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

  if (surveyLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => navigate("/surveys")}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Surveys
              </Button>

              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold">{survey?.title}</h1>
                  {survey?.description && (
                    <p className="text-muted-foreground mt-2">
                      {survey.description}
                    </p>
                  )}
                </div>
                <Button onClick={() => setShowAddQuestionDialog(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>

            {questionsLoading ? (
              <div>Loading questions...</div>
            ) : (
              <div className="space-y-4">
                {questions?.map((question) => (
                  <Card key={question.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {question.question}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Type: {question.question_type}
                        </p>
                        {question.options && Array.isArray(question.options) && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Options:</p>
                            <ul className="list-disc list-inside">
                              {question.options.map((option: string, index: number) => (
                                <li key={index} className="text-sm">
                                  {option}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {id && (
              <AddQuestionDialog
                surveyId={id}
                open={showAddQuestionDialog}
                onOpenChange={setShowAddQuestionDialog}
              />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SurveyDetails;