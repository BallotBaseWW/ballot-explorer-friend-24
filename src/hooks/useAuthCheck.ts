
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log("Checking auth in useAuthCheck...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          // Don't throw error for token refresh issues
          if (!sessionError.message.includes('refresh_token')) {
            throw sessionError;
          }
          // For refresh token errors, just handle as if no session
          console.log("Session refresh failed, treating as no session");
          if (mounted) {
            navigate("/login");
          }
          return false;
        }
        
        console.log("Session in useAuthCheck:", session);
        
        if (!session) {
          console.log("No session found, redirecting to login");
          if (mounted) {
            toast({
              title: "Authentication Required",
              description: "Please log in to access this page.",
              variant: "destructive",
            });
            navigate("/login");
          }
          return false;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("approved")
          .eq("id", session.user.id)
          .single();

        console.log("Profile check in useAuthCheck:", profile, profileError);

        if (profileError) throw profileError;

        if (!profile?.approved) {
          console.log("User not approved, redirecting to login");
          if (mounted) {
            toast({
              title: "Account Pending Approval",
              description: "Your account is pending administrator approval.",
            });
            await supabase.auth.signOut();
            navigate("/login");
          }
          return false;
        }

        console.log("Auth check successful");
        return true;
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          toast({
            title: "Error",
            description: "There was an error checking your authentication status.",
            variant: "destructive",
          });
          navigate("/login");
        }
        return false;
      } finally {
        if (mounted) {
          console.log("Setting isChecking to false");
          setIsChecking(false);
        }
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in useAuthCheck:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
          navigate('/login');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { isChecking };
};
