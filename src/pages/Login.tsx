import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import LoginHeader from "@/components/auth/LoginHeader";
import AuthContainer from "@/components/auth/AuthContainer";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log("Checking initial session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        console.log("Session check result:", session);
        
        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("approved")
            .eq("id", session.user.id)
            .single();

          console.log("Profile check result:", profile, profileError);

          if (profileError) {
            throw profileError;
          }

          if (profile?.approved) {
            console.log("User is approved, navigating to home");
            if (mounted) {
              navigate("/");
            }
          } else {
            console.log("User not approved, showing message");
            toast({
              title: "Account Pending Approval",
              description: "Your account is pending administrator approval.",
            });
            await supabase.auth.signOut();
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        toast({
          title: "Error",
          description: "There was an error checking your session.",
          variant: "destructive",
        });
      } finally {
        if (mounted) {
          console.log("Setting loading to false");
          setIsLoading(false);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === "SIGNED_IN" && session) {
          try {
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("approved")
              .eq("id", session.user.id)
              .single();

            console.log("Profile check on auth change:", profile, error);

            if (error) throw error;

            if (!profile?.approved) {
              console.log("User not approved, showing message");
              toast({
                title: "Account Pending Approval",
                description: "Your account is pending administrator approval.",
              });
              await supabase.auth.signOut();
              return;
            }

            console.log("User is approved, navigating to home");
            navigate("/");
          } catch (error) {
            console.error("Error during auth state change:", error);
            toast({
              title: "Error",
              description: "There was an error processing your login.",
              variant: "destructive",
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginHeader />
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <AuthContainer />
        </div>
      </div>
    </div>
  );
};

export default Login;