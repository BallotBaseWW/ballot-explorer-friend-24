import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormSection } from "./FormSection";
import { formSchema, FormData } from "./types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function RequestAccessForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      organization: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: insertError } = await supabase.from("access_requests").insert([
        {
          full_name: data.full_name,
          email: data.email,
          password_hash: data.password, // Note: In a production environment, you should hash the password
          organization: data.organization,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          status: 'pending'
        },
      ]);

      if (insertError) {
        console.error("Submission error:", insertError);
        if (insertError.code === '23505') { // Unique violation
          setError("An access request with this email already exists.");
        } else {
          setError("There was a problem submitting your request. Please try again.");
        }
        return;
      }

      toast({
        title: "Request Submitted",
        description: "Your access request has been submitted successfully. We'll review it and get back to you soon.",
      });

      navigate("/");
    } catch (error) {
      console.error("Submission error:", error);
      setError("There was a problem submitting your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <FormSection
          form={form}
          name="full_name"
          label="Full Name"
          placeholder="John Doe"
        />
        <FormSection
          form={form}
          name="email"
          label="Email"
          type="email"
          placeholder="john@example.com"
        />
        <FormSection
          form={form}
          name="password"
          label="Password"
          type="password"
        />
        <FormSection
          form={form}
          name="organization"
          label="Organization / Affiliation"
          placeholder="Organization name"
        />
        <FormSection
          form={form}
          name="address"
          label="Address"
          placeholder="123 Main St"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormSection
            form={form}
            name="city"
            label="City"
            placeholder="New York"
          />
          <FormSection
            form={form}
            name="state"
            label="State"
            placeholder="NY"
          />
          <FormSection
            form={form}
            name="zip"
            label="ZIP Code"
            placeholder="10001"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </Form>
  );
}