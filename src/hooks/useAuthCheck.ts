import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth in useAuthCheck...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session in useAuthCheck:", session);
        
        if (!session) {
          console.log("No session found, redirecting to login");
          toast({
            title: "Authentication Required",
            description: "Please log in to access this page.",
            variant: "destructive",
          });
          navigate("/login");
          return false;
        }

        // Check if user is approved
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("approved")
          .eq("id", session.user.id)
          .single();

        console.log("Profile check in useAuthCheck:", profile, error);

        if (error) {
          console.error("Profile check error:", error);
          toast({
            title: "Error",
            description: "There was an error checking your account status.",
            variant: "destructive",
          });
          navigate("/login");
          return false;
        }

        if (!profile?.approved) {
          console.log("User not approved, redirecting to login");
          toast({
            title: "Account Pending Approval",
            description: "Your account is pending administrator approval.",
          });
          await supabase.auth.signOut();
          navigate("/login");
          return false;
        }

        console.log("Auth check successful");
        return true;
      } catch (error) {
        console.error("Auth check error:", error);
        toast({
          title: "Error",
          description: "There was an error checking your authentication status.",
          variant: "destructive",
        });
        navigate("/login");
        return false;
      } finally {
        console.log("Setting isChecking to false");
        setIsChecking(false);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in useAuthCheck:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { isChecking };
};