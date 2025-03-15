
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { PetitionData } from "@/components/petition/types";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { FileDown, Printer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PetitionPreviewProps {
  petitionData: PetitionData;
}

export function PetitionPreview({ petitionData }: PetitionPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  
  const generatePdf = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "legal" // 8.5 x 14 inches
    });
    
    try {
      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Designating Petition", doc.internal.pageSize.width / 2, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Sec. 6-132, Election Law", doc.internal.pageSize.width / 2, 28, { align: "center" });
      
      // Main text
      doc.setFontSize(10);
      let y = 35;
      const lineHeight = 5;
      
      // Introduction paragraph with form fields
      const introText = `I, the undersigned, do hereby state that I am a duly enrolled voter of the ${petitionData.party || "_________________"} Party and entitled to vote at the next primary election of such party, to be held on ${petitionData.electionDate || "_________________"}, 20${petitionData.electionYear.substring(2, 4) || "__"}; that my place of residence is truly stated opposite my signature hereto, and I do hereby designate the following named person (or persons) as a candidate (or candidates) for the nomination of such party for public office or for election to a party position of such party.`;
      
      const splitIntro = doc.splitTextToSize(introText, doc.internal.pageSize.width - 30);
      doc.text(splitIntro, 15, y);
      
      y += (splitIntro.length * lineHeight) + 8;
      
      // Candidates table with thick borders
      autoTable(doc, {
        startY: y,
        head: [
          [
            { content: 'Name(s) of Candidate(s)', styles: { fontStyle: 'bold' } },
            { content: 'Public Office or Party Position\n(Include district number, if applicable)', styles: { fontStyle: 'bold' } },
            { content: 'Residence Address\n(Also post office address if not identical)', styles: { fontStyle: 'bold' } }
          ]
        ],
        body: petitionData.candidates.length > 0 
          ? petitionData.candidates.map(candidate => [
              candidate.name || '',
              candidate.position || '',
              candidate.residence || ''
            ])
          : [['', '', '']],
        theme: 'grid',
        styles: { 
          fontSize: 10, 
          cellPadding: 4,
          lineWidth: 0.5,
          lineColor: [0, 0, 0]
        },
        headStyles: { 
          fillColor: [255, 255, 255], 
          textColor: [0, 0, 0], 
          fontStyle: 'bold',
          lineWidth: 0.5
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 60 },
          2: { cellWidth: 70 }
        },
      });
      
      y = (doc as any).lastAutoTable.finalY + 10;
      
      // Committee text
      const committeeText = `I do hereby appoint as a committee to fill vacancies in accordance with the provisions of the election law (here insert the names and addresses of at least three persons, all of whom shall be enrolled voters of said party):`;
      const splitCommittee = doc.splitTextToSize(committeeText, doc.internal.pageSize.width - 30);
      doc.text(splitCommittee, 15, y);
      
      y += (splitCommittee.length * lineHeight) + 5;
      
      // Committee box with thicker border
      doc.setLineWidth(0.5);
      doc.rect(15, y, doc.internal.pageSize.width - 30, 25);
      if (petitionData.committee) {
        const committeeContent = doc.splitTextToSize(petitionData.committee, doc.internal.pageSize.width - 40);
        doc.text(committeeContent, 20, y + 6);
      }
      
      y += 30;
      
      // Witness statement
      doc.text("In witness whereof, I have hereunto set my hand, the day and year placed opposite my signature.", 15, y);
      
      y += 10;
      
      // Signature table with numbered rows and proper formatting
      // First create the header
      autoTable(doc, {
        startY: y,
        head: [
          [
            { content: 'Date', styles: { fontStyle: 'bold' } },
            { content: 'Name of Signer\n(Signature required. Printed name may be added)', styles: { fontStyle: 'bold' } },
            { content: 'Residence', styles: { fontStyle: 'bold' } },
            { content: 'Enter Town or City\n(Except in NYC enter county)', styles: { fontStyle: 'bold' } }
          ]
        ],
        body: [],
        theme: 'grid',
        styles: { 
          fontSize: 9, 
          lineWidth: 0.5,
          lineColor: [0, 0, 0]
        },
        headStyles: { 
          fillColor: [255, 255, 255], 
          textColor: [0, 0, 0], 
          fontStyle: 'bold',
          lineWidth: 0.5
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 60 },
          2: { cellWidth: 60 },
          3: { cellWidth: 45 }
        },
      });
      
      y = (doc as any).lastAutoTable.finalY;
      
      // Now create individual numbered rows with more height for signatures
      for (let i = 1; i <= petitionData.signatureCount; i++) {
        const rowData = [
          `${i}.          /          / 20__`,
          'Printed Name →',
          '',
          ''
        ];
        
        autoTable(doc, {
          startY: y,
          head: [],
          body: [rowData],
          theme: 'grid',
          styles: { 
            fontSize: 9, 
            cellPadding: { top: 8, bottom: 8, left: 2, right: 2 },
            lineWidth: 0.5,
            lineColor: [0, 0, 0]
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 60 },
            2: { cellWidth: 60 },
            3: { cellWidth: 45 }
          },
        });
        
        y = (doc as any).lastAutoTable.finalY;
      }
      
      y += 5;
      
      // Note about signature lines
      doc.text("(You may use fewer or more signature lines - this is only to show format.)", doc.internal.pageSize.width / 2, y, { align: "center" });
      
      y += 10;
      
      // Add a border around the verification options
      if (petitionData.showWitness || petitionData.showNotary) {
        // Complete ONE of the following section with border
        doc.setLineWidth(0.5);
        const verificationStartY = y;
        
        // Title for verification section
        doc.setFont(undefined, "bold");
        doc.text("Complete ONE of the following", doc.internal.pageSize.width / 2, y, { align: "center" });
        doc.setFont(undefined, "normal");
        
        y += 8;
        
        let verificationHeight = 8; // Start with height of title
        
        if (petitionData.showWitness) {
          // 1. Statement of Witness
          doc.setFont(undefined, "bold");
          doc.text("1. Statement of Witness:", 15, y);
          doc.setFont(undefined, "normal");
          y += 6;
          verificationHeight += 6;
          
          const witnessText = "I (name of witness) __________________________ state: I am a duly qualified voter of the State of New York and am an enrolled voter of the __________________________ Party. I now reside at (residence address) __________________________________________________. Each of the individuals whose names are subscribed to this petition sheet containing (fill in number) __________ signatures, subscribed the same in my presence on the dates above indicated and identified himself or herself to be the individual who signed this sheet. I understand that this statement will be accepted for all purposes as the equivalent of an affidavit and, if it contains a material false statement, shall subject me to the same penalties as if I had been duly sworn.";
          
          const splitWitnessText = doc.splitTextToSize(witnessText, doc.internal.pageSize.width - 40);
          doc.text(splitWitnessText, 20, y);
          
          verificationHeight += (splitWitnessText.length * lineHeight);
          y += (splitWitnessText.length * lineHeight) + 12;
          verificationHeight += 12;
          
          // Date and Signature lines
          doc.line(40, y, 100, y);
          doc.line(140, y, 180, y);
          
          y += 5;
          verificationHeight += 5;
          
          doc.text("Date", 70, y);
          doc.text("Signature of Witness", 160, y);
          
          y += 10;
          verificationHeight += 10;
          
          // Witness identification information
          doc.setFont(undefined, "bold");
          doc.text("Witness Identification Information:", 15, y);
          doc.setFont(undefined, "normal");
          y += 6;
          verificationHeight += 6;
          
          doc.text("The following information for the witness named above must be completed prior to filing with the board of elections in order for this petition to be valid.", 20, y);
          
          y += 10;
          verificationHeight += 10;
          
          // Town/City and County
          doc.line(30, y, 140, y);
          doc.line(150, y, 190, y);
          
          y += 5;
          verificationHeight += 5;
          
          doc.text("Town or City Where Witness Resides", 85, y);
          doc.text("County Where Witness Resides", 170, y);
          
          y += 10;
          verificationHeight += 10;
        }
        
        if (petitionData.showNotary) {
          // 2. Notary Public or Commissioner of Deeds
          doc.setFont(undefined, "bold");
          doc.text("2. Notary Public or Commissioner of Deeds:", 15, y);
          doc.setFont(undefined, "normal");
          y += 6;
          verificationHeight += 6;
          
          const notaryText = "On the dates above indicated before me personally came each of the voters whose signatures appear on this petition sheet containing (fill in number) __________ signatures, who signed same in my presence and who, being by me duly sworn, each for himself or herself, said that the foregoing statement made and subscribed by him or her was true.";
          
          const splitNotaryText = doc.splitTextToSize(notaryText, doc.internal.pageSize.width - 40);
          doc.text(splitNotaryText, 20, y);
          
          verificationHeight += (splitNotaryText.length * lineHeight);
          y += (splitNotaryText.length * lineHeight) + 12;
          verificationHeight += 12;
          
          // Date and Signature lines
          doc.line(40, y, 100, y);
          doc.line(140, y, 180, y);
          
          y += 5;
          verificationHeight += 5;
          
          doc.text("Date", 70, y);
          doc.text("Signature and Official Title of Officer Administering Oath", 160, y);
          
          verificationHeight += 5;
        }
        
        // Draw border around verification section
        doc.rect(15, verificationStartY - 3, doc.internal.pageSize.width - 30, verificationHeight + 6);
      }
      
      // Footer with sample statement and sheet number
      doc.setFontSize(8);
      doc.text("DP - 01 2018", 15, doc.internal.pageSize.height - 10);
      doc.text("(Sample prepared by the State Board of Elections)", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
      doc.text("Sheet No. __________", doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      
      // Save the PDF
      doc.save(`${petitionData.party}_designating_petition.pdf`);
      toast({
        title: "PDF Generated",
        description: "Your designating petition has been generated and downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handlePrint = () => {
    if (previewRef.current) {
      const printContent = previewRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = `
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .petition-preview {
            width: 8.5in;
            max-width: 100%;
            margin: 0 auto;
          }
          @media print {
            body {
              width: 8.5in;
              height: 14in;
              margin: 0;
              padding: 0.5in;
            }
            table {
              border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid black;
            }
            td {
              padding: 8px;
            }
          }
        </style>
        <div class="petition-preview">${printContent}</div>
      `;
      
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-xl font-semibold">Petition Preview</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={generatePdf}>
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div ref={previewRef} className="border rounded-md p-6 bg-white text-black overflow-auto max-h-[800px]">
        <div className="mx-auto max-w-[8.5in]" style={{ minHeight: '14in' }}>
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Designating Petition</h1>
            <p className="text-sm">Sec. 6-132, Election Law</p>
          </div>
          
          {/* Introduction paragraph */}
          <p className="mb-6 text-sm">
            I, the undersigned, do hereby state that I am a duly enrolled voter of the <span className="font-bold underline">{petitionData.party || "_________________"}</span> Party and entitled to vote at the next primary 
            election of such party, to be held on <span className="font-bold underline">{petitionData.electionDate || "_________________"}</span>, 20<span className="font-bold underline">{petitionData.electionYear.substring(2, 4) || "__"}</span>; that my place of residence is truly stated opposite my signature hereto, 
            and I do hereby designate the following named person (or persons) as a candidate (or candidates) for the nomination of such party for public office 
            or for election to a party position of such party.
          </p>
          
          {/* Candidates table */}
          <table className="w-full border-collapse border-2 border-black mb-6 text-sm">
            <thead>
              <tr>
                <th className="border-2 border-black p-2 text-left font-bold">Name(s) of Candidate(s)</th>
                <th className="border-2 border-black p-2 text-left font-bold">
                  Public Office or Party Position
                  <div className="text-xs italic font-normal">(Include district number, if applicable)</div>
                </th>
                <th className="border-2 border-black p-2 text-left font-bold">
                  Residence Address
                  <div className="text-xs italic font-normal">(Also post office address if not identical)</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {petitionData.candidates.length > 0 ? (
                petitionData.candidates.map((candidate, index) => (
                  <tr key={candidate.id}>
                    <td className="border-2 border-black p-2">{candidate.name || ""}</td>
                    <td className="border-2 border-black p-2">{candidate.position || ""}</td>
                    <td className="border-2 border-black p-2">{candidate.residence || ""}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border-2 border-black p-2">&nbsp;</td>
                  <td className="border-2 border-black p-2">&nbsp;</td>
                  <td className="border-2 border-black p-2">&nbsp;</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Committee to fill vacancies */}
          <p className="mb-2 text-sm">
            I do hereby appoint as a committee to fill vacancies in accordance with the provisions of the election law (here insert the names and addresses of at 
            least three persons, all of whom shall be enrolled voters of said party):
          </p>
          <div className="border-2 border-black p-3 mb-6 min-h-[80px] text-sm whitespace-pre-line">
            {petitionData.committee || ""}
          </div>
          
          {/* Witness statement */}
          <p className="mb-4 text-sm">In witness whereof, I have hereunto set my hand, the day and year placed opposite my signature.</p>
          
          {/* Signature table */}
          <table className="w-full border-collapse border-2 border-black mb-2 text-sm">
            <thead>
              <tr>
                <th className="border-2 border-black p-2 text-left font-bold w-[15%]">Date</th>
                <th className="border-2 border-black p-2 text-left font-bold w-[35%]">
                  Name of Signer
                  <div className="text-xs italic font-normal">(Signature required. Printed name may be added)</div>
                </th>
                <th className="border-2 border-black p-2 text-left font-bold w-[30%]">Residence</th>
                <th className="border-2 border-black p-2 text-left font-bold w-[20%]">
                  Enter Town or City
                  <div className="text-xs italic font-normal">(Except in NYC enter county)</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.min(petitionData.signatureCount, 10) }).map((_, index) => (
                <tr key={index}>
                  <td className="border-2 border-black p-2 h-16">
                    {index + 1}. &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp; / 20__
                  </td>
                  <td className="border-2 border-black p-2">
                    <div className="h-8"></div>
                    <div className="text-xs">Printed Name →</div>
                  </td>
                  <td className="border-2 border-black p-2"></td>
                  <td className="border-2 border-black p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <p className="text-center text-xs italic mb-6">
            (You may use fewer or more signature lines - this is only to show format.)
          </p>
          
          {/* Verification section */}
          {(petitionData.showWitness || petitionData.showNotary) && (
            <div className="border-2 border-black p-4 mb-6">
              <p className="text-center font-bold text-sm mb-4">Complete ONE of the following</p>
              
              {petitionData.showWitness && (
                <div className="mb-6">
                  <p className="font-bold text-sm">1. Statement of Witness:</p>
                  <p className="text-sm ml-4 mb-4">
                    I (name of witness) <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> state: I am a duly qualified voter of the State of New York and am an enrolled voter of the <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> Party.
                    <br />I now reside at (residence address) <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>.
                    <br />Each of the individuals whose names are subscribed to this petition sheet containing (fill in number) <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> signatures, 
                    subscribed the same in my presence on the dates above indicated and identified himself or herself to be the individual who signed this sheet.
                    <br />I understand that this statement will be accepted for all purposes as the equivalent of an affidavit and, if it contains a material false 
                    statement, shall subject me to the same penalties as if I had been duly sworn.
                  </p>
                  
                  <div className="flex justify-between text-sm mb-6">
                    <div className="w-1/3">
                      <div className="border-b-2 border-black w-full mb-1">&nbsp;</div>
                      <p className="text-center">Date</p>
                    </div>
                    <div className="w-1/2">
                      <div className="border-b-2 border-black w-full mb-1">&nbsp;</div>
                      <p className="text-center">Signature of Witness</p>
                    </div>
                  </div>
                  
                  <p className="font-bold text-sm">Witness Identification Information:</p>
                  <p className="text-sm ml-4 mb-4">
                    The following information for the witness named above must be completed prior to filing with the board of elections in order for this petition to be valid.
                  </p>
                  
                  <div className="flex justify-between text-sm">
                    <div className="w-[45%]">
                      <div className="border-b-2 border-black w-full mb-1">&nbsp;</div>
                      <p className="text-center">Town or City Where Witness Resides</p>
                    </div>
                    <div className="w-[45%]">
                      <div className="border-b-2 border-black w-full mb-1">&nbsp;</div>
                      <p className="text-center">County Where Witness Resides</p>
                    </div>
                  </div>
                </div>
              )}
              
              {petitionData.showNotary && (
                <div className="mb-4">
                  <p className="font-bold text-sm">2. Notary Public or Commissioner of Deeds:</p>
                  <p className="text-sm ml-4 mb-4">
                    On the dates above indicated before me personally came each of the voters whose signatures appear on this petition sheet containing 
                    (fill in number) <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> signatures, who signed same in my presence and who, being by me duly sworn, each for himself or herself, 
                    said that the foregoing statement made and subscribed by him or her was true.
                  </p>
                  
                  <div className="flex justify-between text-sm">
                    <div className="w-1/3">
                      <div className="border-b-2 border-black w-full mb-1">&nbsp;</div>
                      <p className="text-center">Date</p>
                    </div>
                    <div className="w-1/2">
                      <div className="border-b-2 border-black w-full mb-1">&nbsp;</div>
                      <p className="text-center">Signature and Official Title of Officer Administering Oath</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Footer */}
          <div className="flex justify-between text-xs mt-8">
            <div>DP - 01 2018</div>
            <div>(Sample prepared by the State Board of Elections)</div>
            <div>Sheet No. __________</div>
          </div>
        </div>
      </div>
    </div>
  );
}
