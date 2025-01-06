import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { RequestAccessFields } from "./RequestAccessFields";
import { RequestAccessAddressFields } from "./RequestAccessAddressFields";
import { RequestAccessFormData } from "./types";

export function RequestAccessForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<RequestAccessFormData>();

  const onSubmit = async (data: RequestAccessFormData) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("access_requests").insert({
        email: data.email,
        full_name: data.fullName,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        organization: data.organization,
        password_hash: data.password, // In a real app, this should be hashed
      });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "We'll review your request and get back to you soon.",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <RequestAccessFields form={form} />
        <RequestAccessAddressFields form={form} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Request Access"}
        </Button>
      </form>
    </Form>
  );
}