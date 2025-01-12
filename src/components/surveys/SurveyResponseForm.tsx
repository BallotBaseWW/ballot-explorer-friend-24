import React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";

interface SurveyResponseFormProps {
  question: {
    id: string;
    question: string;
    question_type: "multiple_choice" | "open_ended" | "poll" | "rating";
    options?: string[];
  };
  onSubmit: (response: string) => void;
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function SurveyResponseForm({
  question,
  onSubmit,
  onBack,
  isFirst,
  isLast,
}: SurveyResponseFormProps) {
  const form = useForm({
    defaultValues: {
      response: "",
    },
  });

  const handleSubmit = (values: { response: string }) => {
    onSubmit(values.response);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="response"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl font-semibold">
                {question.question}
              </FormLabel>
              {question.question_type === "multiple_choice" && (
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="space-y-3"
                  >
                    {Array.isArray(question.options) &&
                      question.options.map((option) => (
                        <FormItem
                          key={option}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={option} />
                          </FormControl>
                          <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                  </RadioGroup>
                </FormControl>
              )}
              {question.question_type === "open_ended" && (
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter your response..."
                    className="min-h-[100px]"
                  />
                </FormControl>
              )}
              {question.question_type === "rating" && (
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      defaultValue={[0]}
                      max={5}
                      step={1}
                      onValueChange={([value]) => field.onChange(value.toString())}
                      className="mt-4"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>0</span>
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>
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
            onClick={onBack}
            disabled={isFirst}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button type="submit">
            {isLast ? (
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
  );
}