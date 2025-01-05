import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { VoterRecord } from "@/components/export/types";

export const exportToCsv = (
  selectedFields: string[],
  voters: Array<VoterRecord & { county: string }>,
  listName: string,
  exportAllFields: boolean
) => {
  if (selectedFields.length === 0 && !exportAllFields) return;

  const fieldsToExport = exportAllFields ? Object.keys(voters[0] || {}) : selectedFields;
  const headers = fieldsToExport.map((field) => field.replace(/_/g, ' ').toUpperCase());
  
  const rows = voters.map((voter) =>
    fieldsToExport.map((field) => voter[field as keyof typeof voter] || "")
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

export const exportToPdf = async (
  selectedFields: string[],
  voters: Array<VoterRecord & { county: string }>,
  listName: string,
  exportAllFields: boolean
) => {
  if (selectedFields.length === 0 && !exportAllFields) return;

  const doc = new jsPDF();
  
  try {
    // Add BallotBase text with styling
    doc.setFontSize(24);
    doc.setTextColor(51, 195, 240); // #33C3F0
    doc.text("Ballot", 10, 20);
    doc.setTextColor(234, 56, 76); // #ea384c
    doc.text("Base", 45, 20);
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.text(listName, 10, 40);
    
    // Prepare table data
    const fieldsToExport = exportAllFields ? Object.keys(voters[0] || {}) : selectedFields;
    const headers = fieldsToExport.map((field) => field.replace(/_/g, ' ').toUpperCase());

    const rows = voters.map((voter) =>
      fieldsToExport.map((field) => voter[field as keyof typeof voter] || "")
    );

    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`${listName}_voters.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};