import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import LoginHeader from "@/components/auth/LoginHeader";
import { Header } from "@/components/Header";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth check error:", error);
        toast({
          title: "Error",
          description: "There was a problem checking your authentication status.",
          variant: "destructive",
        });
        return;
      }

      if (session?.user) {
        navigate("/");
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_IN' && session) {
        // Check if user is approved before redirecting
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('approved')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error("Profile check error:", profileError);
          toast({
            title: "Error",
            description: "There was a problem checking your account status.",
            variant: "destructive",
          });
          return;
        }

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
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <LoginHeader 
        heading="Welcome Back"
        text="Enter your email to sign in to your account"
      />
      <main className="flex-1 flex items-start justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-md p-8">
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
                  container: "space-y-6",
                  button: "w-full font-medium shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] hover:from-[#ea384c] hover:via-[#8E77B5] hover:to-[#33C3F0]",
                  input: "w-full transition-all duration-200 focus:ring-2 focus:ring-[#33C3F0] focus:ring-opacity-50",
                  label: "text-foreground/90 font-medium",
                  loader: "border-[#33C3F0]",
                  anchor: "text-[#33C3F0] hover:text-[#8E77B5] transition-colors duration-200 font-medium",
                  divider: "my-6",
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
            <div className="mt-6">
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