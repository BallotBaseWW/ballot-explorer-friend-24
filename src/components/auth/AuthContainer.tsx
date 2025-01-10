import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "./LoadingSpinner";
import { useAuthCheck } from "@/hooks/useAuthCheck";

interface AuthContainerProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const AuthContainer = ({ children, adminOnly = false }: AuthContainerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isChecking } = useAuthCheck();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session check error:", sessionError);
        toast({
          title: "Error",
          description: "There was a problem checking your authentication status.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      if (!session) {
        console.log("No session found, redirecting to login");
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      if (adminOnly) {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (roleError || roleData?.role !== "admin") {
          console.log("User is not an admin, access denied");
          toast({
            title: "Access Denied",
            description: "You do not have permission to access this page.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in AuthContainer:", event, session?.user?.id);
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, adminOnly]);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

export default AuthContainer;