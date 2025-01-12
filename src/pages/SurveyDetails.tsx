import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusIcon, ArrowLeftIcon, PlayIcon, ListIcon, UsersIcon, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AddQuestionDialog } from "@/components/surveys/AddQuestionDialog";
import { AssignSurveyDialog } from "@/components/surveys/AssignSurveyDialog";
import { useState } from "react";
import { ListSelector } from "@/components/search/voter-lists/ListSelector";
import { useToast } from "@/hooks/use-toast";
import { SurveyAnalyticsDashboard } from "@/components/surveys/analytics/SurveyAnalyticsDashboard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ... keep existing code (imports and component setup)

const SurveyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);
  const [showListSelector, setShowListSelector] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
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

      if (error) {
        console.error("Error fetching survey:", error);
        throw error;
      }
      
      console.log("Survey data:", data);
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

      if (error) {
        console.error("Error fetching questions:", error);
        throw error;
      }
      
      console.log("Questions data:", data);
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

      if (error) {
        console.error("Error fetching lists:", error);
        throw error;
      }
      
      return data;
    },
  });

  const assignList = useMutation({
    mutationFn: async (listId: string) => {
      console.log("Assigning list:", listId, "to survey:", id);
      
      const { error: updateError } = await supabase
        .from("surveys")
        .update({ assigned_list_id: listId })
        .eq("id", id);

      if (updateError) {
        console.error("Error updating survey:", updateError);
        throw updateError;
      }

      const { error: itemsError } = await supabase
        .from("voter_list_items")
        .update({ survey_status: 'pending' })
        .eq("list_id", listId);

      if (itemsError) {
        console.error("Error updating voter list items:", itemsError);
        throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey", id] });
      toast({
        title: "List assigned",
        description: "The voter list has been assigned to this survey.",
      });
      setShowListSelector(false);
    },
    onError: (error) => {
      console.error("Error in assignList mutation:", error);
      toast({
        title: "Error",
        description: "Failed to assign list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from("survey_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-questions", id] });
      toast({
        title: "Question deleted",
        description: "The question has been removed from the survey.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateQuestion = useMutation({
    mutationFn: async ({ questionId, question }: { questionId: string; question: string }) => {
      const { error } = await supabase
        .from("survey_questions")
        .update({ question })
        .eq("id", questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-questions", id] });
      setEditingQuestion(null);
      toast({
        title: "Question updated",
        description: "The question has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update question. Please try again.",
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
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const isAdmin = userRole?.role === "admin";

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/surveys")}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Surveys
            </Button>

            <div className="mb-8">
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

            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics">
                {id && <SurveyAnalyticsDashboard surveyId={id} />}
              </TabsContent>

              <TabsContent value="questions">
                {questionsLoading ? (
                  <div>Loading questions...</div>
                ) : (
                  <div className="space-y-4">
                    {questions?.map((question) => (
                      <Card key={question.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {editingQuestion?.id === question.id ? (
                              <div className="flex gap-4 items-center">
                                <Input
                                  value={editingQuestion.question}
                                  onChange={(e) => setEditingQuestion({
                                    ...editingQuestion,
                                    question: e.target.value
                                  })}
                                  className="flex-1"
                                />
                                <Button 
                                  onClick={() => updateQuestion.mutate({
                                    questionId: question.id,
                                    question: editingQuestion.question
                                  })}
                                >
                                  Save
                                </Button>
                                <Button 
                                  variant="ghost"
                                  onClick={() => setEditingQuestion(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <h3 className="text-xl font-semibold mb-2">
                                {question.question}
                              </h3>
                            )}
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
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingQuestion({
                                id: question.id,
                                question: question.question
                              })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this question? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteQuestion.mutate(question.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {id && (
              <>
                <AddQuestionDialog
                  surveyId={id}
                  open={showAddQuestionDialog}
                  onOpenChange={setShowAddQuestionDialog}
                />
                {showListSelector && lists && (
                  <Dialog open={showListSelector} onOpenChange={setShowListSelector}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select a Voter List</DialogTitle>
                      </DialogHeader>
                      <ListSelector
                        lists={lists}
                        onSelect={(listId) => assignList.mutate(listId)}
                        onCreateNew={() => navigate("/lists/new")}
                      />
                    </DialogContent>
                  </Dialog>
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
