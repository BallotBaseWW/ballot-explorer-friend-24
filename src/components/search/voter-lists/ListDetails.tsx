import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportToCsv, exportToPdf } from "@/components/export/exportUtils";
import { useToast } from "@/hooks/use-toast";

export const ListDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: list } = useQuery({
    queryKey: ['voter-list', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voter_lists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: voters } = useQuery({
    queryKey: ['voter-list-items', id],
    queryFn: async () => {
      const { data: listItems, error: listItemsError } = await supabase
        .from('voter_list_items')
        .select('*')
        .eq('list_id', id);

      if (listItemsError) throw listItemsError;

      const voterData = [];
      for (const item of listItems || []) {
        const { data: voter, error: voterError } = await supabase
          .from(item.county)
          .select('*')
          .eq('state_voter_id', item.state_voter_id)
          .single();

        if (voterError) {
          console.error('Error fetching voter:', voterError);
          continue;
        }

        if (voter) {
          voterData.push({ ...voter, county: item.county });
        }
      }

      return voterData;
    },
  });

  const handleExportCsv = () => {
    if (!voters?.length || !list?.name) {
      toast({
        title: "Error",
        description: "No data to export",
        variant: "destructive",
      });
      return;
    }

    try {
      exportToCsv([], voters, list.name, true);
      toast({
        title: "Success",
        description: "List exported to CSV",
      });
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast({
        title: "Error",
        description: "Failed to export list",
        variant: "destructive",
      });
    }
  };

  const handleExportPdf = async () => {
    if (!voters?.length || !list?.name) {
      toast({
        title: "Error",
        description: "No data to export",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportToPdf([], voters, list.name, true);
      toast({
        title: "Success",
        description: "List exported to PDF",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Error",
        description: "Failed to export list",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold">{list?.name}</h2>
              <p className="text-muted-foreground">{list?.description}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {voters?.length || 0} voters in list
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportCsv} variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={handleExportPdf} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>County</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voters?.map((voter) => (
                  <TableRow key={voter.state_voter_id}>
                    <TableCell>
                      {voter.first_name} {voter.middle} {voter.last_name} {voter.suffix}
                    </TableCell>
                    <TableCell>
                      {voter.house} {voter.house_suffix} {voter.pre_st_direction}{" "}
                      {voter.street_name} {voter.post_st_direction}
                      {voter.aptunit_type && `, ${voter.aptunit_type}`}
                      {voter.unit_no && ` ${voter.unit_no}`}, {voter.residence_city},{" "}
                      {voter.zip_code}
                      {voter.zip_four && `-${voter.zip_four}`}
                    </TableCell>
                    <TableCell>{voter.enrolled_party || "No Party"}</TableCell>
                    <TableCell>{voter.voter_status === "A" ? "Active" : "Inactive"}</TableCell>
                    <TableCell className="capitalize">{voter.county}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};