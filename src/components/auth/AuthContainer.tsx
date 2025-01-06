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
    const checkAdminAccess = async () => {
      if (!adminOnly) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (error || roleData?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "You do not have permission to access this page.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    checkAdminAccess();
  }, [adminOnly, navigate, toast]);

  if (isChecking) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

export default AuthContainer;