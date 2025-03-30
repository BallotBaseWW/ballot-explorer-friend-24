
import { UsersTable } from "@/components/admin/UsersTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

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

  // Fetch current data currency
  const { data: dataCurrency, refetch: refetchDataCurrency } = useQuery({
    queryKey: ["dataCurrency"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_currency")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
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

  const handleUpdateDataCurrency = async () => {
    try {
      if (!selectedDate) return;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      await supabase
        .from("data_currency")
        .insert([{
          as_of_date: selectedDate.toISOString(),
          updated_by: user.id,
        }]);

      toast({
        title: "Data currency updated successfully",
      });

      setIsDatePickerOpen(false);
      refetchDataCurrency();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users and their permissions</p>
          </div>
          <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Update Data Currency
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Data Currency Date</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                />
                <Button onClick={handleUpdateDataCurrency}>
                  Update
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {dataCurrency && (
          <p className="text-sm text-muted-foreground mt-2">
            Data current as of: {format(new Date(dataCurrency.as_of_date), "PPP")}
          </p>
        )}
      </div>
      <UsersTable 
        users={users} 
        isLoading={isLoadingUsers}
        refetch={refetch}
      />
    </div>
  );
};

export default Admin;
