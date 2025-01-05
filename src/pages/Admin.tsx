import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { UsersTable } from "@/components/admin/UsersTable";
import type { Profile } from "@/types/profile";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use the auth check hook
  useAuthCheck();

  // Check if user is admin
  const { data: userRole, isLoading: isCheckingRole } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      return roleData?.role;
    },
  });

  // Fetch all users with their roles
  const { data: users, isLoading: isLoadingUsers, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          approved,
          created_at,
          updated_at,
          user_roles (
            role
          )
        `);
      
      return (data as any[])?.map(user => ({
        ...user,
        user_roles: Array.isArray(user.user_roles) ? user.user_roles : [user.user_roles]
      })) as Profile[];
    },
    enabled: userRole === "admin",
  });

  // Redirect non-admin users
  if (!isCheckingRole && userRole !== "admin") {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access the admin panel.",
      variant: "destructive",
    });
    navigate("/");
    return null;
  }

  if (isCheckingRole) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        <UsersTable 
          users={users} 
          isLoading={isLoadingUsers}
          refetch={refetch}
        />
      </main>
    </div>
  );
};

export default Admin;