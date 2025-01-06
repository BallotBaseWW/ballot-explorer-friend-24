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

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  try {
    // Set up fonts and styling
    doc.setFont("helvetica");
    
    // Add header with proper styling
    doc.setFontSize(24);
    doc.setTextColor(51, 195, 240); // Primary blue
    doc.text("Ballot", 20, 20);
    doc.setTextColor(234, 56, 76); // Secondary red
    doc.text("Base", 45, 20);
    
    // Add list information
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(listName, 20, 30);
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 37);
    doc.text(`Total Voters: ${voters.length}`, 20, 43);
    
    // Prepare table data
    const fieldsToExport = exportAllFields ? Object.keys(voters[0] || {}) : selectedFields;
    const headers = fieldsToExport.map(field => ({
      header: field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      dataKey: field
    }));

    const tableData = voters.map(voter => {
      const row: Record<string, string> = {};
      fieldsToExport.forEach(field => {
        row[field] = voter[field as keyof typeof voter]?.toString() || '';
      });
      return row;
    });

    // Add table with improved styling
    autoTable(doc, {
      startY: 50,
      head: [headers.map(h => h.header)],
      body: tableData.map(row => headers.map(h => row[h.dataKey])),
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [51, 195, 240],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Name columns
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' }
      },
      margin: { top: 50, right: 15, bottom: 20, left: 15 },
      didDrawPage: (data) => {
        // Add header to each page
        doc.setFontSize(8);
        doc.text(`${listName} - Page ${doc.getCurrentPageInfo().pageNumber}`, 20, 10);
      },
      willDrawCell: (data) => {
        // Ensure text wrapping for long content
        if (data.cell.text.length > 50) {
          data.cell.styles.cellWidth = 'wrap';
        }
      }
    });

    doc.save(`${listName}_voters.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};