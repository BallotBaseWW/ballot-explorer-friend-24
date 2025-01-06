import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/auth/LoadingSpinner";
import LoginHeader from "@/components/auth/LoginHeader";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AuthContainer } from "@/components/auth/AuthContainer";

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
        <LoginHeader 
          heading="Welcome to BallotBase"
          text="Sign in or create an account to continue"
        />
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
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
                      defaultButtonBackground: "white",
                      defaultButtonBackgroundHover: "#f8f9fa",
                      defaultButtonBorder: "#e5e7eb",
                      defaultButtonText: "#374151",
                      dividerBackground: "#e5e7eb",
                      inputBackground: "white",
                      inputBorder: "#e5e7eb",
                      inputBorderHover: "#33C3F0",
                      inputBorderFocus: "#33C3F0",
                      inputText: "#111827",
                      inputPlaceholder: "#6B7280",
                      messageText: "#374151",
                      anchorTextColor: "#33C3F0",
                      anchorTextHoverColor: "#2980b9"
                    },
                    borderWidths: {
                      buttonBorderWidth: "1px",
                      inputBorderWidth: "1px",
                    },
                    radii: {
                      borderRadiusButton: "0.75rem",
                      buttonBorderRadius: "0.75rem",
                      inputBorderRadius: "0.75rem",
                    },
                    space: {
                      inputPadding: "0.75rem",
                      buttonPadding: "0.75rem",
                      spaceSmall: "0.5rem",
                      spaceMedium: "1rem",
                      spaceLarge: "1.5rem",
                    },
                    fonts: {
                      bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                      buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                    },
                  },
                },
                className: {
                  container: "space-y-6",
                  button: "w-full font-medium shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-[#33C3F0] to-[#2980b9] hover:from-[#2980b9] hover:to-[#33C3F0]",
                  input: "w-full transition-all duration-200 focus:ring-2 focus:ring-[#33C3F0] focus:ring-opacity-50",
                  label: "text-sm font-medium text-gray-700",
                  loader: "border-[#33C3F0]",
                  anchor: "text-[#33C3F0] hover:text-[#2980b9] transition-colors duration-200 font-medium",
                  divider: "my-6",
                  message: "text-sm",
                },
              }}
              providers={[]}
            />
          </AuthContainer>
        </div>
      </div>
    </div>
  );
};

export default Login;