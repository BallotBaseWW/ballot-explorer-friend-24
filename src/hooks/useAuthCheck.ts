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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access this page.",
            variant: "destructive",
          });
          navigate("/login");
          return false;
        }

        // Check if user is approved
        const { data: profile } = await supabase
          .from("profiles")
          .select("approved")
          .eq("id", session.user.id)
          .single();

        if (!profile?.approved) {
          toast({
            title: "Account Pending Approval",
            description: "Your account is pending administrator approval.",
          });
          await supabase.auth.signOut();
          navigate("/login");
          return false;
        }

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