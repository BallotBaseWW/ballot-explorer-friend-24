import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Database } from "@/integrations/supabase/types";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

interface ExportDialogProps {
  voters: Array<VoterRecord & { county: string }>;
  listName: string;
}

const EXPORT_FIELDS = {
  personal: {
    label: "Personal Information",
    fields: {
      first_name: "First Name",
      middle: "Middle Name",
      last_name: "Last Name",
      suffix: "Suffix",
      date_of_birth: "Date of Birth",
      gender: "Gender",
      enrolled_party: "Party",
    },
  },
  address: {
    label: "Address",
    fields: {
      house: "House Number",
      street_name: "Street Name",
      residence_city: "City",
      zip_code: "ZIP Code",
    },
  },
  districts: {
    label: "Districts",
    fields: {
      election_district: "Election District",
      congressional_district: "Congressional District",
      assembly_district: "Assembly District",
      state_senate_district: "Senate District",
    },
  },
  voting: {
    label: "Voting History",
    fields: {
      last_date_voted: "Last Vote Date",
      last_year_voted: "Last Vote Year",
      voter_history: "Voting History",
    },
  },
};

export const ExportDialog = ({ voters, listName }: ExportDialogProps) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleFieldToggle = (field: string) => {
    setSelectedFields((current) =>
      current.includes(field)
        ? current.filter((f) => f !== field)
        : [...current, field]
    );
  };

  const exportToCsv = () => {
    if (selectedFields.length === 0) return;

    const headers = selectedFields.map((field) => {
      const category = Object.values(EXPORT_FIELDS).find((cat) =>
        Object.keys(cat.fields).includes(field)
      );
      return category?.fields[field as keyof typeof category.fields];
    });

    const rows = voters.map((voter) =>
      selectedFields.map((field) => voter[field as keyof typeof voter] || "")
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${listName}_voters.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPdf = () => {
    if (selectedFields.length === 0) return;

    const doc = new jsPDF();
    
    // Add logo
    const logoImg = new Image();
    logoImg.src = '/logo.png';
    doc.addImage(logoImg, 'PNG', 10, 10, 40, 40);
    
    // Add title
    doc.setFontSize(18);
    doc.text(listName, 60, 30);
    
    // Prepare table data
    const headers = selectedFields.map((field) => {
      const category = Object.values(EXPORT_FIELDS).find((cat) =>
        Object.keys(cat.fields).includes(field)
      );
      return category?.fields[field as keyof typeof category.fields];
    });

    const rows = voters.map((voter) =>
      selectedFields.map((field) => voter[field as keyof typeof voter] || "")
    );

    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 60,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`${listName}_voters.pdf`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Voter Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            {Object.entries(EXPORT_FIELDS).map(([category, { label, fields }]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-medium">{label}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(fields).map(([field, label]) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => handleFieldToggle(field)}
                      />
                      <Label htmlFor={field}>{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={exportToCsv}
              disabled={selectedFields.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="default"
              onClick={exportToPdf}
              disabled={selectedFields.length === 0}
            >
              Export PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};