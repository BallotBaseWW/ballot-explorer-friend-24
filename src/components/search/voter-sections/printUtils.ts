import { jsPDF } from "jspdf";
import { Database } from "@/integrations/supabase/types";
import { formatDate } from "@/lib/utils";

type VoterRecord = Database["public"]["Tables"]["bronx"]["Row"];

const addSection = (
  doc: jsPDF,
  title: string,
  content: { label: string; value: string | null }[],
  startY: number
): number => {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, startY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  let currentY = startY + 10;
  const lineHeight = 7;
  
  content.forEach(({ label, value }) => {
    if (value) {
      doc.text(`${label}: ${value}`, 25, currentY);
      currentY += lineHeight;
    }
  });
  
  return currentY + 5;
};

export const printVoterRecord = async (voter: VoterRecord) => {
  const doc = new jsPDF();
  let currentY = 20;

  // Add BallotBase header
  doc.setFontSize(24);
  doc.setTextColor(51, 195, 240);
  doc.text("Ballot", 20, currentY);
  doc.setTextColor(234, 56, 76);
  doc.text("Base", 55, currentY);
  
  currentY += 20;
  
  // Add title
  doc.setTextColor(0);
  doc.setFontSize(16);
  doc.text("Voter Record", 20, currentY);
  
  currentY += 20;

  // Personal Information
  currentY = addSection(doc, "Personal Information", [
    { label: "Name", value: `${voter.first_name} ${voter.middle || ''} ${voter.last_name} ${voter.suffix || ''}`.trim() },
    { label: "Date of Birth", value: voter.date_of_birth ? formatDate(voter.date_of_birth) : null },
    { label: "Gender", value: voter.gender },
    { label: "Party", value: voter.enrolled_party },
    { label: "Voter Status", value: voter.voter_status },
    { label: "County Voter No.", value: voter.county_voter_no },
  ], currentY);

  // Address Information
  currentY = addSection(doc, "Address Information", [
    { label: "Residence", value: `${voter.house} ${voter.house_suffix || ''} ${voter.pre_st_direction || ''} ${voter.street_name} ${voter.post_st_direction || ''}`.trim() },
    { label: "Unit", value: voter.unit_no ? `${voter.aptunit_type || 'Unit'} ${voter.unit_no}` : null },
    { label: "City", value: voter.residence_city },
    { label: "ZIP", value: voter.zip_code ? `${voter.zip_code}${voter.zip_four ? '-' + voter.zip_four : ''}` : null },
  ], currentY);

  // District Information
  currentY = addSection(doc, "District Information", [
    { label: "Election District", value: voter.election_district },
    { label: "Legislative District", value: voter.legislative_district },
    { label: "Congressional District", value: voter.congressional_district },
    { label: "Senate District", value: voter.state_senate_district },
    { label: "Assembly District", value: voter.assembly_district },
    { label: "Ward", value: voter.ward },
  ], currentY);

  // Voting History
  currentY = addSection(doc, "Voting History", [
    { label: "Last Date Voted", value: voter.last_date_voted },
    { label: "Last Year Voted", value: voter.last_year_voted },
    { label: "Last County Voted", value: voter.last_county_voted },
    { label: "Voter History", value: voter.voter_history },
  ], currentY);

  // Registration Information
  currentY = addSection(doc, "Registration Information", [
    { label: "Application Date", value: voter.application_date },
    { label: "Application Source", value: voter.application_source },
    { label: "Previous Name", value: voter.last_registered_name },
    { label: "Previous Address", value: voter.last_registered_address },
  ], currentY);

  // Save the PDF
  doc.save(`voter_record_${voter.last_name}_${voter.first_name}.pdf`);
};