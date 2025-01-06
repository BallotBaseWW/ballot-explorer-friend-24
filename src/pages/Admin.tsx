import { Header } from "@/components/Header";
import { UsersTable } from "@/components/admin/UsersTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Profile } from "@/types/profile";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;
      
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return false;
      }
      
      return roleData?.role === "admin";
    },
  });

  // Fetch users data
  const { data: users, isLoading: isLoadingUsers, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles (
            role
          )
        `);

      if (error) throw error;
      
      // Transform the data to ensure user_roles is always an array
      return (data as Profile[]).map(user => ({
        ...user,
        user_roles: Array.isArray(user.user_roles) 
          ? user.user_roles 
          : user.user_roles 
            ? [user.user_roles]
            : []
      }));
    },
  });

  // Handle non-admin access
  useEffect(() => {
    if (!isCheckingAdmin && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, isCheckingAdmin, navigate, toast]);

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">Manage users and their permissions</p>
        </div>
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