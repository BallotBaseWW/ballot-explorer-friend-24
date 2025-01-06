import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "./types";

interface FormSectionProps {
  form: UseFormReturn<FormData>;
  name: keyof FormData;
  label: string;
  placeholder?: string;
  type?: string;
}

export function FormSection({ form, name, label, placeholder, type = "text" }: FormSectionProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground/90">{label}</FormLabel>
          <FormControl>
            <Input 
              type={type} 
              placeholder={placeholder} 
              className="bg-background/50 border-border/50" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}