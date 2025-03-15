
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
      doc.text("Designating Petition", doc.internal.pageSize.width / 2, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.text("Sec. 6-132, Election Law", doc.internal.pageSize.width / 2, 26, { align: "center" });
      
      // Main text
      doc.setFontSize(10);
      let y = 35;
      const lineHeight = 5;
      
      // Introduction paragraph with form fields
      const introText = `I, the undersigned, do hereby state that I am a duly enrolled voter of the ${petitionData.party || "________"} Party and entitled to vote at the next primary election of such party, to be held on ${petitionData.electionDate || "________"}, 20${petitionData.electionYear.substring(2, 4) || "__"}; that my place of residence is truly stated opposite my signature hereto, and I do hereby designate the following named person (or persons) as a candidate (or candidates) for the nomination of such party for public office or for election to a party position of such party.`;
      
      const splitIntro = doc.splitTextToSize(introText, doc.internal.pageSize.width - 30);
      doc.text(splitIntro, 15, y);
      
      y += (splitIntro.length * lineHeight) + 10;
      
      // Candidates table
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
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
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
      
      // Committee box
      doc.rect(15, y, doc.internal.pageSize.width - 30, 25);
      if (petitionData.committee) {
        const committeeContent = doc.splitTextToSize(petitionData.committee, doc.internal.pageSize.width - 40);
        doc.text(committeeContent, 20, y + 5);
      }
      
      y += 30;
      
      // Witness statement
      doc.text("In witness whereof, I have hereunto set my hand, the day and year placed opposite my signature.", 15, y);
      
      y += 7;
      
      // Signature table
      const rows = [];
      for (let i = 1; i <= petitionData.signatureCount; i++) {
        rows.push([
          `${i}.          /          / 20__`,
          '',
          '',
          ''
        ]);
      }
      
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
        body: rows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: { top: 3, bottom: 10, left: 2, right: 2 } },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 60 },
          2: { cellWidth: 60 },
          3: { cellWidth: 45 }
        },
      });
      
      y = (doc as any).lastAutoTable.finalY + 5;
      
      // Note about signature lines
      doc.text("(You may use fewer or more signature lines - this is only to show format.)", doc.internal.pageSize.width / 2, y, { align: "center" });
      
      y += 10;
      
      if (petitionData.showWitness || petitionData.showNotary) {
        // Complete ONE of the following section
        doc.setFont(undefined, "bold");
        doc.text("Complete ONE of the following", doc.internal.pageSize.width / 2, y, { align: "center" });
        y += 5;
        
        if (petitionData.showWitness) {
          // 1. Statement of Witness
          doc.setFont(undefined, "bold");
          doc.text("1. Statement of Witness:", 15, y);
          doc.setFont(undefined, "normal");
          y += 5;
          
          const witnessText = "I (name of witness) __________________ state: I am a duly qualified voter of the State of New York and am an enrolled voter of the __________________ Party. I now reside at (residence address) __________________. Each of the individuals whose names are subscribed to this petition sheet containing (fill in number) __________ signatures, subscribed the same in my presence on the dates above indicated and identified himself or herself to be the individual who signed this sheet. I understand that this statement will be accepted for all purposes as the equivalent of an affidavit and, if it contains a material false statement, shall subject me to the same penalties as if I had been duly sworn.";
          
          const splitWitnessText = doc.splitTextToSize(witnessText, doc.internal.pageSize.width - 30);
          doc.text(splitWitnessText, 15, y);
          
          y += (splitWitnessText.length * lineHeight) + 10;
          
          // Date and Signature lines
          doc.text("______________________", 40, y);
          doc.text("______________________________________", 150, y);
          y += 5;
          doc.text("Date", 40, y);
          doc.text("Signature of Witness", 150, y);
          
          y += 8;
          
          // Witness identification information
          doc.setFont(undefined, "bold");
          doc.text("Witness Identification Information", 15, y);
          doc.setFont(undefined, "normal");
          y += 5;
          
          doc.text("The following information for the witness named above must be completed prior to filing with the board of elections in order for this petition to be valid.", 15, y);
          
          y += 8;
          
          // Town/City and County
          doc.text("______________________", 60, y);
          doc.text("______________________", 160, y);
          y += 5;
          doc.text("Town or City Where Witness Resides", 60, y);
          doc.text("County Where Witness Resides", 160, y);
          
          y += 10;
        }
        
        if (petitionData.showNotary) {
          // 2. Notary Public or Commissioner of Deeds
          doc.setFont(undefined, "bold");
          doc.text("2. Notary Public or Commissioner of Deeds:", 15, y);
          doc.setFont(undefined, "normal");
          y += 5;
          
          const notaryText = "On the dates above indicated before me personally came each of the voters whose signatures appear on this petition sheet containing (fill in number) __________ signatures, who signed same in my presence and who, being by me duly sworn, each for himself or herself, said that the foregoing statement made and subscribed by him or her was true.";
          
          const splitNotaryText = doc.splitTextToSize(notaryText, doc.internal.pageSize.width - 30);
          doc.text(splitNotaryText, 15, y);
          
          y += (splitNotaryText.length * lineHeight) + 10;
          
          // Date and Signature lines
          doc.text("______________________", 40, y);
          doc.text("______________________________________", 150, y);
          y += 5;
          doc.text("Date", 40, y);
          doc.text("Signature and Official Title of Officer Administering Oath", 150, y);
        }
      }
      
      // Footer
      doc.setFontSize(8);
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
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">Designating Petition</h1>
            <p className="text-sm">Sec. 6-132, Election Law</p>
          </div>
          
          {/* Introduction paragraph */}
          <p className="mb-4 text-sm">
            I, the undersigned, do hereby state that I am a duly enrolled voter of the <span className="font-bold">{petitionData.party || "________"}</span> Party and entitled to vote at the next primary 
            election of such party, to be held on <span className="font-bold">{petitionData.electionDate || "________"}</span>, 20<span className="font-bold">{petitionData.electionYear.substring(2, 4) || "__"}</span>; that my place of residence is truly stated opposite my signature hereto, 
            and I do hereby designate the following named person (or persons) as a candidate (or candidates) for the nomination of such party for public office 
            or for election to a party position of such party.
          </p>
          
          {/* Candidates table */}
          <table className="w-full border-collapse border border-gray-800 mb-4 text-sm">
            <thead>
              <tr>
                <th className="border border-gray-800 p-2 text-left">Name(s) of Candidate(s)</th>
                <th className="border border-gray-800 p-2 text-left">
                  Public Office or Party Position
                  <div className="text-xs italic">(Include district number, if applicable)</div>
                </th>
                <th className="border border-gray-800 p-2 text-left">
                  Residence Address
                  <div className="text-xs italic">(Also post office address if not identical)</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {petitionData.candidates.length > 0 ? (
                petitionData.candidates.map((candidate, index) => (
                  <tr key={candidate.id}>
                    <td className="border border-gray-800 p-2">{candidate.name || ""}</td>
                    <td className="border border-gray-800 p-2">{candidate.position || ""}</td>
                    <td className="border border-gray-800 p-2">{candidate.residence || ""}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border border-gray-800 p-2">&nbsp;</td>
                  <td className="border border-gray-800 p-2">&nbsp;</td>
                  <td className="border border-gray-800 p-2">&nbsp;</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Committee to fill vacancies */}
          <p className="mb-2 text-sm">
            I do hereby appoint as a committee to fill vacancies in accordance with the provisions of the election law (here insert the names and addresses of at 
            least three persons, all of whom shall be enrolled voters of said party):
          </p>
          <div className="border border-gray-800 p-2 mb-4 min-h-[60px] text-sm whitespace-pre-line">
            {petitionData.committee || ""}
          </div>
          
          {/* Witness statement */}
          <p className="mb-2 text-sm">In witness whereof, I have hereunto set my hand, the day and year placed opposite my signature.</p>
          
          {/* Signature table */}
          <table className="w-full border-collapse border border-gray-800 mb-2 text-sm">
            <thead>
              <tr>
                <th className="border border-gray-800 p-2 text-left">Date</th>
                <th className="border border-gray-800 p-2 text-left">
                  Name of Signer
                  <div className="text-xs italic">(Signature required. Printed name may be added)</div>
                </th>
                <th className="border border-gray-800 p-2 text-left">Residence</th>
                <th className="border border-gray-800 p-2 text-left">
                  Enter Town or City
                  <div className="text-xs italic">(Except in NYC enter county)</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.min(petitionData.signatureCount, 10) }).map((_, index) => (
                <tr key={index}>
                  <td className="border border-gray-800 p-2">
                    {index + 1}. &nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp; / 20__
                  </td>
                  <td className="border border-gray-800 p-2 h-12"></td>
                  <td className="border border-gray-800 p-2"></td>
                  <td className="border border-gray-800 p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <p className="text-center text-xs italic mb-4">
            (You may use fewer or more signature lines - this is only to show format.)
          </p>
          
          {/* Verification section */}
          {(petitionData.showWitness || petitionData.showNotary) && (
            <>
              <p className="text-center font-bold text-sm mb-2">Complete ONE of the following</p>
              
              {petitionData.showWitness && (
                <div className="mb-4">
                  <p className="font-bold text-sm">1. Statement of Witness:</p>
                  <p className="text-sm mb-2">
                    I (name of witness) __________________ state: I am a duly qualified voter of the State of New York and am an enrolled voter of the __________________ Party.
                    I now reside at (residence address) __________________.
                    Each of the individuals whose names are subscribed to this petition sheet containing (fill in number) __________ signatures, 
                    subscribed the same in my presence on the dates above indicated and identified himself or herself to be the individual who signed this sheet.
                    I understand that this statement will be accepted for all purposes as the equivalent of an affidavit and, if it contains a material false 
                    statement, shall subject me to the same penalties as if I had been duly sworn.
                  </p>
                  
                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <div className="border-b border-black w-40 mb-1">&nbsp;</div>
                      <p>Date</p>
                    </div>
                    <div>
                      <div className="border-b border-black w-64 mb-1">&nbsp;</div>
                      <p>Signature of Witness</p>
                    </div>
                  </div>
                  
                  <p className="font-bold text-sm">Witness Identification Information:</p>
                  <p className="text-sm mb-2">
                    The following information for the witness named above must be completed prior to filing with the board of elections in order for this petition to be valid.
                  </p>
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <div className="border-b border-black w-48 mb-1">&nbsp;</div>
                      <p>Town or City Where Witness Resides</p>
                    </div>
                    <div>
                      <div className="border-b border-black w-48 mb-1">&nbsp;</div>
                      <p>County Where Witness Resides</p>
                    </div>
                  </div>
                </div>
              )}
              
              {petitionData.showNotary && (
                <div className="mb-4">
                  <p className="font-bold text-sm">2. Notary Public or Commissioner of Deeds:</p>
                  <p className="text-sm mb-2">
                    On the dates above indicated before me personally came each of the voters whose signatures appear on this petition sheet containing 
                    (fill in number) __________ signatures, who signed same in my presence and who, being by me duly sworn, each for himself or herself, 
                    said that the foregoing statement made and subscribed by him or her was true.
                  </p>
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <div className="border-b border-black w-40 mb-1">&nbsp;</div>
                      <p>Date</p>
                    </div>
                    <div>
                      <div className="border-b border-black w-64 mb-1">&nbsp;</div>
                      <p>Signature and Official Title of Officer Administering Oath</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Footer */}
          <div className="text-right text-xs mt-8">
            Sheet No. __________
          </div>
        </div>
      </div>
    </div>
  );
}
