import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusIcon, ArrowLeftIcon, PlayIcon, ListIcon, UsersIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AddQuestionDialog } from "@/components/surveys/AddQuestionDialog";
import { AssignSurveyDialog } from "@/components/surveys/AssignSurveyDialog";
import { useState } from "react";
import { ListSelector } from "@/components/search/voter-lists/ListSelector";
import { useToast } from "@/components/ui/use-toast";

const SurveyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);
  const [showListSelector, setShowListSelector] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: survey, isLoading: surveyLoading } = useQuery({
    queryKey: ["survey", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*, voter_lists(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      console.log("Survey data:", data); // Debug log
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
      console.log("Questions data:", data); // Debug log
      return data;
    },
  });

  const { data: lists } = useQuery({
    queryKey: ["voter-lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voter_lists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const assignList = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from("surveys")
        .update({ assigned_list_id: listId })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey", id] });
      toast({
        title: "List assigned",
        description: "The voter list has been assigned to this survey.",
      });
      setShowListSelector(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const isAdmin = userRole?.role === "admin";

  // Debug log for button state
  console.log("Button state:", {
    questionsLength: questions?.length,
    assignedListId: survey?.assigned_list_id,
    isDisabled: !questions?.length || !survey?.assigned_list_id
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
                  {survey?.voter_lists && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Assigned List: {survey.voter_lists?.name || "None"}
                    </p>
                  )}
                </div>
                <div className="flex gap-4">
                  {isAdmin && (
                    <Button
                      variant="outline"
                      onClick={() => setShowAssignDialog(true)}
                    >
                      <UsersIcon className="h-4 w-4 mr-2" />
                      Manage Assignments
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setShowListSelector(true)}
                  >
                    <ListIcon className="h-4 w-4 mr-2" />
                    {survey?.assigned_list_id ? "Change List" : "Assign List"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/surveys/${id}/respond`)}
                    disabled={!questions?.length || !survey?.assigned_list_id}
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start Survey
                  </Button>
                  <Button onClick={() => setShowAddQuestionDialog(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
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
              <>
                <AddQuestionDialog
                  surveyId={id}
                  open={showAddQuestionDialog}
                  onOpenChange={setShowAddQuestionDialog}
                />
                {showListSelector && lists && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md p-6">
                      <h2 className="text-xl font-semibold mb-4">Assign Voter List</h2>
                      <ListSelector
                        lists={lists}
                        onSelect={(listId) => assignList.mutate(listId)}
                        onCreateNew={() => navigate("/lists/new")}
                      />
                      <Button
                        variant="ghost"
                        className="mt-4"
                        onClick={() => setShowListSelector(false)}
                      >
                        Cancel
                      </Button>
                    </Card>
                  </div>
                )}
                {isAdmin && (
                  <AssignSurveyDialog
                    surveyId={id}
                    open={showAssignDialog}
                    onOpenChange={setShowAssignDialog}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SurveyDetails;
