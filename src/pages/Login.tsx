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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
              Welcome to BallotBase
            </h2>
            <p className="text-base text-gray-600">
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
                    anchorTextColor: "#6B7280",
                    anchorTextHoverColor: "#374151"
                  },
                  borderWidths: {
                    buttonBorderWidth: "1px",
                    inputBorderWidth: "1px",
                  },
                  radii: {
                    borderRadiusButton: "8px",
                    buttonBorderRadius: "8px",
                    inputBorderRadius: "8px",
                  },
                  space: {
                    inputPadding: "12px",
                    buttonPadding: "12px",
                    spaceSmall: "4px",
                    spaceMedium: "8px",
                    spaceLarge: "16px",
                  },
                  fonts: {
                    bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                    buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
                  },
                },
              },
              className: {
                container: "animate-fade-in space-y-4 bg-white p-8 rounded-xl shadow-lg",
                button: "shadow-sm hover:shadow-md transition-all duration-200 font-medium hover:bg-blue-50",
                input: "focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200",
                label: "text-sm font-medium text-gray-700",
                loader: "border-blue-500",
                anchor: "text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200",
                divider: "my-6",
                message: "text-sm",
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