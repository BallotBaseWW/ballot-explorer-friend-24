import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ResourcesList() {
  const { toast } = useToast();

  const { data: resources, isLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select(`
          *,
          categories (
            name
          ),
          profiles (
            full_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDownload = async (filePath: string, title: string) => {
    const { data, error } = await supabase.storage
      .from("resources")
      .download(filePath);

    if (error) {
      toast({
        title: "Error downloading file",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = title;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDelete = async (id: string, filePath: string) => {
    const { error: storageError } = await supabase.storage
      .from("resources")
      .remove([filePath]);

    if (storageError) {
      toast({
        title: "Error deleting file",
        description: storageError.message,
        variant: "destructive",
      });
      return;
    }

    const { error: dbError } = await supabase
      .from("resources")
      .delete()
      .eq("id", id);

    if (dbError) {
      toast({
        title: "Error deleting resource",
        description: dbError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Resource deleted",
      description: "The resource has been deleted successfully.",
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Uploaded By</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources?.map((resource) => (
          <TableRow key={resource.id}>
            <TableCell>{resource.title}</TableCell>
            <TableCell>{resource.categories?.name}</TableCell>
            <TableCell>{resource.profiles?.full_name}</TableCell>
            <TableCell className="space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDownload(resource.file_path, resource.title)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(resource.id, resource.file_path)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}