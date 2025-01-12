import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Slider } from "@/components/ui/slider";

const SurveyResponse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      response: "",
    },
  });

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

  const submitResponse = useMutation({
    mutationFn: async (values: { response: string }) => {
      const currentQuestion = questions?.[currentQuestionIndex];
      if (!currentQuestion) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("survey_responses").insert({
        survey_id: id,
        question_id: currentQuestion.id,
        response: values.response,
        state_voter_id: "temp", // This will need to be updated with actual voter ID
        county: "temp", // This will need to be updated with actual county
        created_by: user.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-responses"] });
      form.reset();
      
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

  const onSubmit = (values: { response: string }) => {
    submitResponse.mutate(values);
  };

  if (surveyLoading || questionsLoading) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions?.[currentQuestionIndex];

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
            </div>

            {currentQuestion && (
              <Card className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="response"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xl font-semibold">
                            {currentQuestion.question}
                          </FormLabel>
                          {currentQuestion.question_type === "multiple_choice" && (
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                {Array.isArray(currentQuestion.options) && currentQuestion.options.map((option: string) => (
                                  <FormItem
                                    key={option}
                                    className="flex items-center space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <RadioGroupItem value={option} />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                          )}
                          {currentQuestion.question_type === "open_ended" && (
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Enter your response..."
                                className="min-h-[100px]"
                              />
                            </FormControl>
                          )}
                          {currentQuestion.question_type === "rating" && (
                            <FormControl>
                              <Slider
                                defaultValue={[0]}
                                max={5}
                                step={1}
                                onValueChange={([value]) => field.onChange(value.toString())}
                                className="mt-4"
                              />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between items-center pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                      >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button type="submit">
                        {currentQuestionIndex === (questions?.length ?? 0) - 1 ? (
                          <>
                            Complete
                            <CheckIcon className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Next
                            <ArrowRightIcon className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SurveyResponse;