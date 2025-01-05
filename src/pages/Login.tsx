import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          // Check if user is approved
          const { data: profile } = await supabase
            .from("profiles")
            .select("approved")
            .eq("id", session?.user?.id)
            .single();

          if (!profile?.approved) {
            toast({
              title: "Account Pending Approval",
              description: "Your account is pending administrator approval.",
            });
            await supabase.auth.signOut();
            return;
          }

          navigate("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Welcome to BallotBase
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in or create an account to continue
            </p>
          </div>
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
                    defaultButtonBorder: "lightgray",
                    defaultButtonText: "gray",
                    dividerBackground: "#e9ecef",
                    inputBackground: "transparent",
                    inputBorder: "lightgray",
                    inputBorderHover: "#33C3F0",
                    inputBorderFocus: "#33C3F0",
                    inputText: "black",
                    inputPlaceholder: "darkgray",
                  },
                  borderWidths: {
                    buttonBorderWidth: "1px",
                    inputBorderWidth: "1px",
                  },
                  radii: {
                    borderRadiusButton: "6px",
                    buttonBorderRadius: "6px",
                    inputBorderRadius: "6px",
                  },
                },
              },
              className: {
                container: "animate-fade-in",
                button: "hover:shadow-md transition-shadow duration-200",
                input: "focus:ring-2 focus:ring-primary focus:ring-opacity-50",
                label: "text-sm font-medium text-gray-700",
                loader: "border-primary",
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;