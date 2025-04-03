
import { jsPDF } from "jspdf";
import { PetitionData } from "./types";

export const generatePetitionPDF = (petitionData: PetitionData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter"
  });
  
  // Set font
  doc.setFont("helvetica");
  
  // Add title
  doc.setFontSize(16);
  const title = petitionData.party ? `${petitionData.party} PARTY DESIGNATING PETITION` : "Designating Petition";
  doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text("(Sec. 6-132, Election Law)", doc.internal.pageSize.width / 2, 26, { align: "center" });
  
  // Add intro text
  doc.setFontSize(10);
  const introText = `I, the undersigned, do hereby state that I am a duly enrolled voter of the ${petitionData.party} Party and entitled to vote at the next primary election of such party, to be held on ${petitionData.electionDate}, ${petitionData.electionYear}; that my place of residence is truly stated opposite my signature hereto, and I do hereby designate the following named person (or persons) as a candidate (or candidates) for the nomination of such party for public office or for election to a party position of such party.`;
  
  const splitIntro = doc.splitTextToSize(introText, 180);
  doc.text(splitIntro, 15, 35);
  
  // Add candidates table
  const startY = 50;
  const colWidths = [60, 60, 65]; // Adjusted for better proportions
  const rowHeight = 10;
  
  // Table headers
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  
  // Draw the table borders
  doc.setDrawColor(0, 0, 0);
  
  // Name header
  doc.rect(15, startY, colWidths[0], rowHeight);
  doc.text("Name(s) of Candidate(s)", 17, startY + 6);
  
  // Position header
  doc.rect(15 + colWidths[0], startY, colWidths[1], rowHeight);
  doc.text("Public Office or Party Position", 17 + colWidths[0], startY + 6);
  
  // Address header
  doc.rect(15 + colWidths[0] + colWidths[1], startY, colWidths[2], rowHeight);
  doc.text("Residence Address", 17 + colWidths[0] + colWidths[1], startY + 6);
  
  // Candidate rows
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  let currentY = startY + rowHeight;
  
  if (petitionData.candidates.length === 0) {
    const emptyRowHeight = 10;
    doc.rect(15, currentY, colWidths[0] + colWidths[1] + colWidths[2], emptyRowHeight);
    currentY += emptyRowHeight;
  } else {
    for (const candidate of petitionData.candidates) {
      const candidateRowHeight = 15;
      
      // Cells
      doc.rect(15, currentY, colWidths[0], candidateRowHeight);
      doc.rect(15 + colWidths[0], currentY, colWidths[1], candidateRowHeight);
      doc.rect(15 + colWidths[0] + colWidths[1], currentY, colWidths[2], candidateRowHeight);
      
      // Content
      const nameLines = doc.splitTextToSize(candidate.name, colWidths[0] - 4);
      const positionLines = doc.splitTextToSize(candidate.position, colWidths[1] - 4);
      const addressLines = doc.splitTextToSize(candidate.residence, colWidths[2] - 4);
      
      doc.setFont("helvetica", "bold");
      doc.text(nameLines, 17, currentY + 5);
      doc.setFont("helvetica", "normal");
      doc.text(positionLines, 17 + colWidths[0], currentY + 5);
      doc.text(addressLines, 17 + colWidths[0] + colWidths[1], currentY + 5);
      
      currentY += candidateRowHeight;
    }
  }
  
  // Committee to fill vacancies
  currentY += 5;
  doc.setFontSize(9);
  const committeeText = "I do hereby appoint as a committee to fill vacancies in accordance with the provisions of the election law (here insert the names and addresses of at least three persons, all of whom shall be enrolled voters of said party):";
  const splitCommittee = doc.splitTextToSize(committeeText, 180);
  doc.text(splitCommittee, 15, currentY);
  
  currentY += splitCommittee.length * 5;
  doc.rect(15, currentY, colWidths[0] + colWidths[1] + colWidths[2], 20);
  
  // Committee members
  if (petitionData.committeeMembers && petitionData.committeeMembers.length > 0) {
    let committeeMembersText = "";
    petitionData.committeeMembers.forEach((member, index) => {
      committeeMembersText += `${member.name}, residing at ${member.residence}`;
      if (index < petitionData.committeeMembers.length - 1) {
        committeeMembersText += "; ";
      }
    });
    
    const splitMembers = doc.splitTextToSize(committeeMembersText, 175);
    doc.text(splitMembers, 17, currentY + 5);
  } else if (petitionData.committee) {
    const splitMembers = doc.splitTextToSize(petitionData.committee, 175);
    doc.text(splitMembers, 17, currentY + 5);
  }
  
  // Witness statement
  currentY += 25;
  doc.text("In witness whereof, I have hereunto set my hand, the day and year placed opposite my signature.", 15, currentY);
  
  // Signature table
  currentY += 5;
  const signatureColWidths = [20, 60, 60, 45]; // Adjusted for better proportions
  const headerHeight = 10;
  
  // Table headers
  doc.setFont("helvetica", "bold");
  
  // Draw header row
  doc.rect(15, currentY, signatureColWidths[0], headerHeight);
  doc.rect(15 + signatureColWidths[0], currentY, signatureColWidths[1], headerHeight);
  doc.rect(15 + signatureColWidths[0] + signatureColWidths[1], currentY, signatureColWidths[2], headerHeight);
  doc.rect(15 + signatureColWidths[0] + signatureColWidths[1] + signatureColWidths[2], currentY, signatureColWidths[3], headerHeight);
  
  // Date header
  doc.text("Date", 17, currentY + 6);
  
  // Name header
  doc.text("Name of Signer", 17 + signatureColWidths[0], currentY + 6);
  
  // Residence header
  doc.text("Residence", 17 + signatureColWidths[0] + signatureColWidths[1], currentY + 6);
  
  // Town/City header
  doc.text("Enter Town or City", 17 + signatureColWidths[0] + signatureColWidths[1] + signatureColWidths[2], currentY + 6);
  
  // Signature rows
  currentY += headerHeight;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  for (let i = 0; i < petitionData.signatureCount; i++) {
    const lineNum = i + 1;
    const rowHeight = 15;
    
    // Cells
    doc.rect(15, currentY, signatureColWidths[0], rowHeight);
    doc.rect(15 + signatureColWidths[0], currentY, signatureColWidths[1], rowHeight);
    doc.rect(15 + signatureColWidths[0] + signatureColWidths[1], currentY, signatureColWidths[2], rowHeight);
    doc.rect(15 + signatureColWidths[0] + signatureColWidths[1] + signatureColWidths[2], currentY, signatureColWidths[3], rowHeight);
    
    // Line number and date format
    doc.text(`${lineNum}. __/__/20__`, 17, currentY + 6);
    
    // Printed name
    doc.text("Printed Name", 17 + signatureColWidths[0] + 20, currentY + 12);
    
    currentY += rowHeight;
  }
  
  // Footer
  currentY = 270;
  doc.setFontSize(8);
  doc.text("DP – 01.2018", 15, currentY);
  doc.setFont("helvetica", "italic");
  doc.text("(Sample prepared by the State Board of Elections)", doc.internal.pageSize.width / 2, currentY, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("Sheet No. _________", 180, currentY, { align: "right" });
  
  // Save and return the PDF
  return doc.save(`designating_petition_${petitionData.party}_${petitionData.electionYear}.pdf`);
};
