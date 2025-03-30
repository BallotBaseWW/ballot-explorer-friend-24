
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CreateSurveyDialog } from "@/components/surveys/CreateSurveyDialog";
import { useState } from "react";

const Surveys = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: surveys, isLoading } = useQuery({
    queryKey: ["surveys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Surveys</h1>
          <p className="text-muted-foreground">
            Create and manage voter surveys
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Survey
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {surveys?.map((survey) => (
            <Card
              key={survey.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/surveys/${survey.id}`)}
            >
              <h3 className="text-xl font-semibold mb-2">{survey.title}</h3>
              {survey.description && (
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {survey.description}
                </p>
              )}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  Created{" "}
                  {new Date(survey.created_at).toLocaleDateString()}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    survey.is_active
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {survey.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </Card>
          ))}
          
          {surveys?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No surveys created yet. Click "Create Survey" to get started.
            </div>
          )}
        </div>
      )}

      <CreateSurveyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

export default Surveys;
