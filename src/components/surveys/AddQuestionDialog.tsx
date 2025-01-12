import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface AddQuestionDialogProps {
  surveyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  question: string;
  questionType: "multiple_choice" | "open_ended" | "poll" | "rating";
  options?: string[];
}

export function AddQuestionDialog({ surveyId, open, onOpenChange }: AddQuestionDialogProps) {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const questionType = watch("questionType");

  const addOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Get the current count of questions for this survey
      const { count } = await supabase
        .from("survey_questions")
        .select("*", { count: "exact" })
        .eq("survey_id", surveyId);

      const { error } = await supabase
        .from("survey_questions")
        .insert({
          survey_id: surveyId,
          question: data.question,
          question_type: data.questionType,
          order_index: (count || 0) + 1,
          options: ["multiple_choice", "poll"].includes(data.questionType) ? options : null,
        });

      if (error) {
        console.error("Error adding question:", error);
        toast({
          title: "Error",
          description: "Failed to add question. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Question added",
        description: "Your question has been added to the survey.",
      });

      queryClient.invalidateQueries({ queryKey: ["survey-questions"] });
      reset();
      setOptions([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error in try-catch:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              {...register("question", { required: "Question is required" })}
              placeholder="Enter your question"
            />
            {errors.question && (
              <p className="text-sm text-destructive">{errors.question.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionType">Question Type</Label>
            <Select
              onValueChange={(value) => {
                const event = {
                  target: { value, name: "questionType" },
                };
                register("questionType").onChange(event);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="open_ended">Open Ended</SelectItem>
                <SelectItem value="poll">Poll</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {["multiple_choice", "poll"].includes(questionType || "") && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Enter an option"
                />
                <Button type="button" onClick={addOption}>
                  Add
                </Button>
              </div>
              <ul className="space-y-2">
                {options.map((option, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-secondary p-2 rounded"
                  >
                    <span>{option}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}