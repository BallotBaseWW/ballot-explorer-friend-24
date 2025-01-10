import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import LoginHeader from "@/components/auth/LoginHeader";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("approved")
            .eq("id", session.user.id)
            .single();

          if (profileError) throw profileError;

          if (profile?.approved) {
            if (mounted) navigate("/");
          } else {
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
        if (mounted) setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          try {
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("approved")
              .eq("id", session.user.id)
              .single();

            if (error) throw error;

            if (!profile?.approved) {
              toast({
                title: "Account Pending Approval",
                description: "Your account is pending administrator approval.",
              });
              await supabase.auth.signOut();
              return;
            }

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

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginHeader 
            heading="Welcome to BallotBase"
            text="Sign in or create an account to continue"
          />
          <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-border/50">
            <AuthContainer>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: "#33C3F0",
                        brandAccent: "#2980b9",
                        brandButtonText: "white",
                        defaultButtonBackground: "hsl(var(--background))",
                        defaultButtonBackgroundHover: "hsl(var(--muted))",
                        defaultButtonBorder: "hsl(var(--border))",
                        defaultButtonText: "hsl(var(--foreground))",
                        dividerBackground: "hsl(var(--border))",
                        inputBackground: "hsl(var(--background))",
                        inputBorder: "hsl(var(--border))",
                        inputBorderHover: "#33C3F0",
                        inputBorderFocus: "#33C3F0",
                        inputText: "hsl(var(--foreground))",
                        inputPlaceholder: "hsl(var(--muted-foreground))",
                        messageText: "hsl(var(--foreground))",
                        anchorTextColor: "#33C3F0",
                        anchorTextHoverColor: "#2980b9"
                      },
                    },
                  },
                  className: {
                    container: "space-y-6",
                    button: "w-full font-medium shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-[#33C3F0] to-[#2980b9] hover:from-[#2980b9] hover:to-[#33C3F0]",
                    input: "w-full transition-all duration-200 focus:ring-2 focus:ring-[#33C3F0] focus:ring-opacity-50",
                    label: "text-foreground/90 font-medium",
                    loader: "border-[#33C3F0]",
                    anchor: "text-[#33C3F0] hover:text-[#2980b9] transition-colors duration-200 font-medium",
                    divider: "my-6",
                    message: "text-sm",
                  },
                }}
                providers={[]}
              />
              <div className="mt-6 text-center">
                <Button
                  onClick={() => navigate("/request-access")}
                  className="w-full bg-gradient-to-r from-[#33C3F0] to-[#2980b9] hover:from-[#2980b9] hover:to-[#33C3F0] text-white transition-all duration-300"
                >
                  Request Access
                </Button>
              </div>
            </AuthContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;