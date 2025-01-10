import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import LoginHeader from "@/components/auth/LoginHeader";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LoginHeader 
        heading="Welcome Back"
        text="Enter your email to sign in to your account"
      />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-md p-6">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                extend: true,
                variables: {
                  default: {
                    colors: {
                      brand: "#33C3F0",
                      brandAccent: "#8E77B5",
                    },
                  },
                },
                className: {
                  container: "space-y-4",
                  button: "w-full font-medium shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] hover:from-[#ea384c] hover:via-[#8E77B5] hover:to-[#33C3F0]",
                  input: "w-full transition-all duration-200 focus:ring-2 focus:ring-[#33C3F0] focus:ring-opacity-50",
                  label: "text-foreground/90 font-medium",
                  loader: "border-[#33C3F0]",
                  anchor: "text-[#33C3F0] hover:text-[#8E77B5] transition-colors duration-200 font-medium",
                  divider: "my-4",
                  message: "text-sm",
                },
              }}
              providers={[]}
              localization={{
                variables: {
                  sign_up: {
                    link_text: "",
                  },
                },
              }}
            />
            <div className="mt-4 text-center">
              <Button
                onClick={() => navigate("/request-access")}
                className="w-full bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] hover:from-[#ea384c] hover:via-[#8E77B5] hover:to-[#33C3F0] text-white transition-all duration-300"
              >
                Request Access
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;