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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome to BallotBase
          </h2>
          <p className="text-lg text-gray-600">
            Sign in or create an account to continue
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
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
            providers={["google"]}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;