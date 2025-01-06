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

  const doc = new jsPDF('landscape');
  
  try {
    // Add BallotBase text with styling
    doc.setFontSize(24);
    doc.setTextColor(51, 195, 240); // #33C3F0
    doc.text("Ballot", 14, 20);
    doc.setTextColor(234, 56, 76); // #ea384c
    doc.text("Base", 49, 20);
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.text(listName, 14, 35);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 45);
    doc.text(`Total voters: ${voters.length}`, 14, 52);
    
    // Prepare table data
    const fieldsToExport = exportAllFields ? Object.keys(voters[0] || {}) : selectedFields;
    const headers = fieldsToExport.map((field) => field.replace(/_/g, ' ').toUpperCase());

    const rows = voters.map((voter) =>
      fieldsToExport.map((field) => voter[field as keyof typeof voter] || "")
    );

    // Add table with adjusted styling for better readability
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 60,
      styles: { 
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        // Adjust column widths based on content
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
      },
      margin: { top: 60, right: 14, bottom: 20, left: 14 },
      didDrawPage: (data) => {
        // Add header to each page
        doc.setFontSize(10);
        doc.text(`${listName} (Page ${doc.getCurrentPageInfo().pageNumber})`, 14, 10);
      },
    });

    doc.save(`${listName}_voters.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};