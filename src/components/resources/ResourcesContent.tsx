import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ResourcesList } from "./ResourcesList";
import { CreateResourceDialog } from "./CreateResourceDialog";
import { CategoriesManagement } from "./CategoriesManagement";
import { MatchingFundsCalculator } from "./MatchingFundsCalculator";
import { supabase } from "@/integrations/supabase/client";

export function ResourcesContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: userRole } = useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
        
      if (error) throw error;
      return data?.role;
    },
  });

  const isAdmin = userRole === "admin";

  return (
    <div className="space-y-12">
      <MatchingFundsCalculator />
      
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Resources</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
        
        {isAdmin && <CategoriesManagement />}
        
        <ResourcesList />
        <CreateResourceDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </div>
  );
}