
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
  doc.text("Designating Petition", doc.internal.pageSize.width / 2, 20, { align: "center" });
  doc.setFontSize(10);
  doc.text("Sec. 6-132, Election Law", doc.internal.pageSize.width / 2, 26, { align: "center" });
  
  // Add intro text
  doc.setFontSize(10);
  const introText = `I, the undersigned, do hereby state that I am a duly enrolled voter of the ${petitionData.party} Party and entitled to vote at the next primary election of such party, to be held on ${petitionData.electionDate}, ${petitionData.electionYear}; that my place of residence is truly stated opposite my signature hereto, and I do hereby designate the following named person (or persons) as a candidate (or candidates) for the nomination of such party for public office or for election to a party position of such party.`;
  
  const splitIntro = doc.splitTextToSize(introText, 180);
  doc.text(splitIntro, 15, 35);
  
  // Add candidates table
  const startY = 50;
  const colWidths = [60, 60, 60];
  const rowHeight = 10;
  
  // Table headers
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(15, startY, colWidths[0], rowHeight);
  doc.text("Name(s) of Candidate(s)", 17, startY + 6);
  
  doc.rect(15 + colWidths[0], startY, colWidths[1], rowHeight);
  doc.text("Public Office or Party Position", 17 + colWidths[0], startY + 4);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text("(Include district number, if applicable)", 17 + colWidths[0], startY + 8);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(15 + colWidths[0] + colWidths[1], startY, colWidths[2], rowHeight);
  doc.text("Residence Address", 17 + colWidths[0] + colWidths[1], startY + 4);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text("(Also post office address if not identical)", 17 + colWidths[0] + colWidths[1], startY + 8);
  
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
      
      doc.text(nameLines, 17, currentY + 5);
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
  const signatureColWidths = [20, 60, 60, 40];
  const headerHeight = 10;
  
  // Table headers
  doc.setFont("helvetica", "bold");
  doc.rect(15, currentY, signatureColWidths[0], headerHeight);
  doc.text("Date", 17, currentY + 6);
  
  doc.rect(15 + signatureColWidths[0], currentY, signatureColWidths[1], headerHeight);
  doc.text("Name of Signer", 17 + signatureColWidths[0], currentY + 4);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text("(Signature required. Printed name may be added)", 17 + signatureColWidths[0], currentY + 8);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(15 + signatureColWidths[0] + signatureColWidths[1], currentY, signatureColWidths[2], headerHeight);
  doc.text("Residence", 17 + signatureColWidths[0] + signatureColWidths[1], currentY + 6);
  
  doc.rect(15 + signatureColWidths[0] + signatureColWidths[1] + signatureColWidths[2], currentY, signatureColWidths[3], headerHeight);
  doc.text("Enter Town or City", 17 + signatureColWidths[0] + signatureColWidths[1] + signatureColWidths[2], currentY + 4);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text("(Except in NYC enter county)", 17 + signatureColWidths[0] + signatureColWidths[1] + signatureColWidths[2], currentY + 8);
  
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
    
    // Printed name line for signature column
    doc.setFontSize(7);
    doc.text("Printed Name →", 17 + signatureColWidths[0] + 5, currentY + 12);
    doc.setFontSize(9);
    
    currentY += rowHeight;
  }
  
  // Note about signature lines
  currentY += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("(You may use fewer or more signature lines - this is only to show format.)", doc.internal.pageSize.width / 2, currentY, { align: "center" });
  
  // Verification section (Witness and Notary)
  currentY += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Complete ONE of the following", doc.internal.pageSize.width / 2, currentY, { align: "center" });
  currentY += 10;
  
  if (petitionData.showWitness) {
    doc.text("1. Statement of Witness:", 17, currentY);
    doc.setFont("helvetica", "normal");
    currentY += 5;
    
    let witnessText = "I (name of witness) _____________________ state: I am a duly qualified voter of the State of New York and am an enrolled voter of the ___________________ Party.";
    doc.text(witnessText, 17, currentY);
    currentY += 10;
    
    witnessText = "I now reside at (residence address) _____________________.";
    doc.text(witnessText, 17, currentY);
    currentY += 10;
    
    witnessText = "Each of the individuals whose names are subscribed to this petition sheet containing (fill in number) ___________ signatures, subscribed the same in my presence on the dates above indicated and identified himself or herself to be the individual who signed this sheet.";
    const witnessLines = doc.splitTextToSize(witnessText, 180);
    doc.text(witnessLines, 17, currentY);
    currentY += witnessLines.length * 5 + 5;
    
    witnessText = "I understand that this statement will be accepted for all purposes as the equivalent of an affidavit and, if it contains a material false statement, shall subject me to the same penalties as if I had been duly sworn.";
    const witnessLines2 = doc.splitTextToSize(witnessText, 180);
    doc.text(witnessLines2, 17, currentY);
    currentY += witnessLines2.length * 5 + 10;
    
    // Signature lines
    doc.line(17, currentY, 70, currentY);
    doc.line(90, currentY, 180, currentY);
    currentY += 5;
    doc.text("Date", 40, currentY);
    doc.text("Signature of Witness", 135, currentY);
    currentY += 10;
    
    // Witness identification
    doc.setFont("helvetica", "bold");
    doc.text("Witness Identification Information:", 17, currentY);
    doc.setFont("helvetica", "normal");
    currentY += 5;
    
    const infoText = "The following information for the witness named above must be completed prior to filing with the board of elections in order for this petition to be valid.";
    const infoLines = doc.splitTextToSize(infoText, 180);
    doc.text(infoLines, 17, currentY);
    currentY += infoLines.length * 5 + 10;
    
    // Town/county lines
    doc.line(17, currentY, 90, currentY);
    doc.line(110, currentY, 180, currentY);
    currentY += 5;
    doc.text("Town or City Where Witness Resides", 50, currentY);
    doc.text("County Where Witness Resides", 145, currentY);
    currentY += 10;
  }
  
  if (petitionData.showNotary) {
    if (petitionData.showWitness) {
      doc.setFont("helvetica", "bold");
    }
    doc.text("2. Notary Public or Commissioner of Deeds:", 17, currentY);
    doc.setFont("helvetica", "normal");
    currentY += 5;
    
    const notaryText = "On the dates above indicated before me personally came each of the voters whose signatures appear on this petition sheet containing (fill in number) ___________ signatures, who signed same in my presence and who, being by me duly sworn, each for himself or herself, said that the foregoing statement made and subscribed by him or her was true.";
    const notaryLines = doc.splitTextToSize(notaryText, 180);
    doc.text(notaryLines, 17, currentY);
    currentY += notaryLines.length * 5 + 10;
    
    // Signature lines
    doc.line(17, currentY, 70, currentY);
    doc.line(90, currentY, 180, currentY);
    currentY += 5;
    doc.text("Date", 40, currentY);
    doc.text("Signature and Official Title of Officer Administering Oath", 135, currentY);
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
