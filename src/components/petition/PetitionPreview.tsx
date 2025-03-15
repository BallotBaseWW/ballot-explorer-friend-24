
import { useRef } from "react";
import { PetitionData } from "@/pages/DesignatingPetition";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

interface PetitionPreviewProps {
  petitionData: PetitionData;
}

export const PetitionPreview = ({ petitionData }: PetitionPreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'legal', // 8.5 x 14 inches
    });

    // Set font styles
    doc.setFont("helvetica");
    
    // Title
    doc.setFontSize(18);
    doc.text("Designating Petition", doc.internal.pageSize.width / 2, 40, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("Sec. 6-132, Election Law", doc.internal.pageSize.width / 2, 60, { align: "center" });
    
    // Main text
    doc.setFontSize(12);
    const mainText = `I, the undersigned, do hereby state that I am a duly enrolled voter of the ${petitionData.party} Party and entitled to vote at the next primary election of such party, to be held on ${petitionData.electionDate}, ${petitionData.electionYear}; that my place of residence is truly stated opposite my signature hereto, and I do hereby designate the following named person (or persons) as a candidate (or candidates) for the nomination of such party for public office or for election to a party position of such party.`;
    
    const textWidth = doc.internal.pageSize.width - 80;
    const splitText = doc.splitTextToSize(mainText, textWidth);
    doc.text(splitText, 40, 90);
    
    // Candidates table
    autoTable(doc, {
      startY: 140,
      head: [['Name(s) of Candidate(s)', 'Public Office or Party Position\n(Include district number, if applicable)', 'Residence Address\n(Also post office address if not identical)']],
      body: petitionData.candidates.map(candidate => [
        candidate.name,
        `${candidate.position}${candidate.district ? `\n${candidate.district}` : ''}`,
        `${candidate.address}${candidate.postOfficeAddress ? `\n${candidate.postOfficeAddress}` : ''}`
      ]),
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' }
      }
    });
    
    // Committee text
    const committeeY = (doc as any).lastAutoTable.finalY + 20;
    const committeeText = `I do hereby appoint as a committee to fill vacancies in accordance with the provisions of the election law (here insert the names and addresses of at least three persons, all of whom shall be enrolled voters of said party):`;
    const splitCommitteeText = doc.splitTextToSize(committeeText, textWidth);
    doc.text(splitCommitteeText, 40, committeeY);
    
    // Committee box
    const committeeBoxY = committeeY + splitCommitteeText.length * 15 + 5;
    doc.rect(40, committeeBoxY, textWidth, 60);
    
    if (petitionData.committeeMembers) {
      const committeeLines = doc.splitTextToSize(petitionData.committeeMembers, textWidth - 20);
      doc.text(committeeLines, 50, committeeBoxY + 20);
    }
    
    // Witness statement
    const witnessY = committeeBoxY + 80;
    doc.text("In witness whereof, I have hereunto set my hand, the day and year placed opposite my signature.", 40, witnessY);
    
    // Signatures table
    autoTable(doc, {
      startY: witnessY + 20,
      head: [
        [
          'Date', 
          'Name of Signer\n(Signature required. Printed name may be added)', 
          'Residence', 
          'Enter Town or City\n(Except in NYC enter county)'
        ]
      ],
      body: [
        ['1. ___ / ___ / 20___', '', '', ''],
        ['2. ___ / ___ / 20___', '', '', ''],
        ['3. ___ / ___ / 20___', '', '', ''],
        ['4. ___ / ___ / 20___', '', '', ''],
        ['5. ___ / ___ / 20___', '', '', ''],
      ],
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 140 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 100 }
      },
      didDrawCell: (data) => {
        // Add "Printed Name →" for signature rows
        if (data.row.index > 0 && data.column.index === 1 && data.cell.section === 'body') {
          const { x, y, height } = data.cell;
          doc.setFontSize(8);
          doc.text("Printed Name →", x + 5, y + height - 5);
        }
      }
    });
    
    // Note about signature lines
    const signatureLineNoteY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.text("(You may use fewer or more signature lines - this is only to show format.)", doc.internal.pageSize.width / 2, signatureLineNoteY, { align: "center" });
    
    // Complete ONE of the following
    const completeOneY = signatureLineNoteY + 30;
    doc.setFontSize(12);
    doc.text("Complete ONE of the following", doc.internal.pageSize.width / 2, completeOneY, { align: "center" });
    
    // Statement of Witness section
    if (petitionData.witnessName || !petitionData.showNotary) {
      const witnessStatementY = completeOneY + 30;
      doc.setFontSize(12);
      doc.text("1. Statement of Witness:", 40, witnessStatementY);
      
      doc.setFontSize(10);
      let witnessStatement = `I ${petitionData.witnessName} state: I am a duly qualified voter of the State of New York and am an enrolled voter of the ${petitionData.witnessParty} Party.`;
      let splitWitnessStatement = doc.splitTextToSize(witnessStatement, textWidth);
      doc.text(splitWitnessStatement, 60, witnessStatementY + 20);
      
      let residenceStatement = `I now reside at ${petitionData.witnessResidence}.`;
      let splitResidenceStatement = doc.splitTextToSize(residenceStatement, textWidth);
      doc.text(splitResidenceStatement, 60, witnessStatementY + 50);
      
      let signaturesStatement = `Each of the individuals whose names are subscribed to this petition sheet containing (fill in number) __________ signatures, subscribed the same in my presence on the dates above indicated and identified himself or herself to be the individual who signed this sheet.`;
      let splitSignaturesStatement = doc.splitTextToSize(signaturesStatement, textWidth);
      doc.text(splitSignaturesStatement, 60, witnessStatementY + 80);
      
      let understandStatement = `I understand that this statement will be accepted for all purposes as the equivalent of an affidavit and, if it contains a material false statement, shall subject me to the same penalties as if I had been duly sworn.`;
      let splitUnderstandStatement = doc.splitTextToSize(understandStatement, textWidth);
      doc.text(splitUnderstandStatement, 60, witnessStatementY + 120);
      
      // Date and signature lines
      doc.line(60, witnessStatementY + 160, 150, witnessStatementY + 160);
      doc.text("Date", 105, witnessStatementY + 175, { align: "center" });
      
      doc.line(200, witnessStatementY + 160, 400, witnessStatementY + 160);
      doc.text("Signature of Witness", 300, witnessStatementY + 175, { align: "center" });
      
      // Witness identification
      doc.setFontSize(11);
      doc.text("Witness Identification Information:", 40, witnessStatementY + 200);
      
      doc.setFontSize(10);
      doc.text("The following information for the witness named above must be completed prior to filing with the board of elections in order for this petition to be valid.", 60, witnessStatementY + 220);
      
      // Town/County where witness resides
      doc.line(60, witnessStatementY + 250, 250, witnessStatementY + 250);
      doc.text("Town or City Where Witness Resides", 155, witnessStatementY + 265, { align: "center" });
      
      doc.line(300, witnessStatementY + 250, 500, witnessStatementY + 250);
      doc.text("County Where Witness Resides", 400, witnessStatementY + 265, { align: "center" });
      
      if (petitionData.witnessTown) {
        doc.text(petitionData.witnessTown, 155, witnessStatementY + 245, { align: "center" });
      }
      
      if (petitionData.witnessCounty) {
        doc.text(petitionData.witnessCounty, 400, witnessStatementY + 245, { align: "center" });
      }
    }
    
    // Notary Public section (conditional)
    if (petitionData.showNotary) {
      const notaryY = completeOneY + 30;
      
      if (petitionData.witnessName) {
        // If witness section is shown, start notary after witness section
        const notaryY = completeOneY + 300;
        doc.setFontSize(12);
        doc.text("2. Notary Public or Commissioner of Deeds:", 40, notaryY);

        doc.setFontSize(10);
        let notaryStatement = `On the dates above indicated before me personally came each of the voters whose signatures appear on this petition sheet containing ${petitionData.notarySignatureCount || "_______"} signatures, who signed same in my presence and who, being by me duly sworn, each for himself or herself, said that the foregoing statement made and subscribed by him or her was true.`;
        let splitNotaryStatement = doc.splitTextToSize(notaryStatement, textWidth);
        doc.text(splitNotaryStatement, 60, notaryY + 20);

        // Date and signature lines
        doc.line(60, notaryY + 70, 150, notaryY + 70);
        doc.text("Date", 105, notaryY + 85, { align: "center" });

        doc.line(200, notaryY + 70, 500, notaryY + 70);
        doc.text("Signature and Official Title of Officer Administering Oath", 350, notaryY + 85, { align: "center" });
      } else {
        // If witness section is not shown, start notary right after the "Complete ONE" text
        doc.setFontSize(12);
        doc.text("2. Notary Public or Commissioner of Deeds:", 40, notaryY);

        doc.setFontSize(10);
        let notaryStatement = `On the dates above indicated before me personally came each of the voters whose signatures appear on this petition sheet containing ${petitionData.notarySignatureCount || "_______"} signatures, who signed same in my presence and who, being by me duly sworn, each for himself or herself, said that the foregoing statement made and subscribed by him or her was true.`;
        let splitNotaryStatement = doc.splitTextToSize(notaryStatement, textWidth);
        doc.text(splitNotaryStatement, 60, notaryY + 20);

        // Date and signature lines
        doc.line(60, notaryY + 70, 150, notaryY + 70);
        doc.text("Date", 105, notaryY + 85, { align: "center" });

        doc.line(200, notaryY + 70, 500, notaryY + 70);
        doc.text("Signature and Official Title of Officer Administering Oath", 350, notaryY + 85, { align: "center" });
      }
    }
    
    // Footer
    const footerY = doc.internal.pageSize.height - 40;
    doc.setFontSize(9);
    doc.text("DP - 01.2018", 40, footerY);
    doc.text("(Sample prepared by the State Board of Elections)", doc.internal.pageSize.width / 2, footerY, { align: "center" });
    doc.text("Sheet No. _________", 530, footerY);
    
    // Save the PDF
    doc.save("designating_petition.pdf");
  };

  const handlePrint = () => {
    if (previewRef.current) {
      const printContent = previewRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Designating Petition</title>
              <style>
                body { font-family: Arial, sans-serif; }
                .petition-container { max-width: 8.5in; margin: 0 auto; padding: 0.5in; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                table, th, td { border: 1px solid black; }
                th, td { padding: 8px; text-align: left; }
                .signature-line { border-bottom: 1px solid black; height: 30px; }
                @media print {
                  @page { size: legal portrait; margin: 0.5in; }
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              <div class="petition-container">${printContent}</div>
              <script>window.onload = function() { window.print(); window.close(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-4 mb-6">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button onClick={generatePDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div ref={previewRef} className="petition-preview border rounded p-6 bg-white text-black">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Designating Petition</h1>
          <p>Sec. 6-132, Election Law</p>
        </div>

        <p className="mb-6">
          I, the undersigned, do hereby state that I am a duly enrolled voter of the 
          <span className="font-bold"> {petitionData.party || "_______"} </span> 
          Party and entitled to vote at the next primary election of such party, to be held on 
          <span className="font-bold"> {petitionData.electionDate || "_______"}</span>, 
          <span className="font-bold"> {petitionData.electionYear || "_______"}</span>; 
          that my place of residence is truly stated opposite my signature hereto, and I do hereby designate 
          the following named person (or persons) as a candidate (or candidates) for the nomination of such 
          party for public office or for election to a party position of such party.
        </p>

        <table className="w-full border-collapse mb-6">
          <thead>
            <tr>
              <th className="border p-2 w-1/3">Name(s) of Candidate(s)</th>
              <th className="border p-2 w-1/3">
                Public Office or Party Position
                <div className="text-xs">(Include district number, if applicable)</div>
              </th>
              <th className="border p-2 w-1/3">
                Residence Address
                <div className="text-xs">(Also post office address if not identical)</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {petitionData.candidates.map((candidate, index) => (
              <tr key={index}>
                <td className="border p-2">{candidate.name || "_______________"}</td>
                <td className="border p-2">
                  {candidate.position || "_______________"}
                  {candidate.district && <div>{candidate.district}</div>}
                </td>
                <td className="border p-2">
                  {candidate.address || "_______________"}
                  {candidate.postOfficeAddress && <div>{candidate.postOfficeAddress}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mb-2">
          I do hereby appoint as a committee to fill vacancies in accordance with the provisions of the election law 
          (here insert the names and addresses of at least three persons, all of whom shall be enrolled voters of said party):
        </p>

        <div className="border p-4 mb-6 min-h-20">
          {petitionData.committeeMembers || ""}
        </div>

        <p className="mb-6">In witness whereof, I have hereunto set my hand, the day and year placed opposite my signature.</p>

        <table className="w-full border-collapse mb-6">
          <thead>
            <tr>
              <th className="border p-2 w-1/6">Date</th>
              <th className="border p-2 w-1/3">
                Name of Signer
                <div className="text-xs">(Signature required. Printed name may be added)</div>
              </th>
              <th className="border p-2 w-1/3">Residence</th>
              <th className="border p-2 w-1/6">
                Enter Town or City
                <div className="text-xs">(Except in NYC enter county)</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((num) => (
              <tr key={num} className="h-16">
                <td className="border p-2">{num}. ___ / ___ / 20___</td>
                <td className="border p-2 relative">
                  <div className="absolute bottom-1 left-2 text-xs">Printed Name →</div>
                </td>
                <td className="border p-2"></td>
                <td className="border p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-center text-sm italic mb-6">(You may use fewer or more signature lines - this is only to show format.)</p>

        <div className="text-center font-bold mb-6">Complete ONE of the following</div>

        <div className="mb-6">
          <h3 className="font-bold mb-2">1. Statement of Witness:</h3>
          <p>
            I <span className="font-bold">{petitionData.witnessName || "_______________"}</span> state: 
            I am a duly qualified voter of the State of New York and am an enrolled voter of the 
            <span className="font-bold"> {petitionData.witnessParty || "_______________"} </span>Party.
          </p>
          <p className="my-2">
            I now reside at <span className="font-bold">{petitionData.witnessResidence || "_______________________________"}</span>.
          </p>
          <p className="my-2">
            Each of the individuals whose names are subscribed to this petition sheet containing (fill in number) ________ signatures, 
            subscribed the same in my presence on the dates above indicated and identified himself or herself to be the individual who signed this sheet.
          </p>
          <p className="my-2">
            I understand that this statement will be accepted for all purposes as the equivalent of an affidavit and, 
            if it contains a material false statement, shall subject me to the same penalties as if I had been duly sworn.
          </p>
          
          <div className="flex gap-8 mt-6">
            <div className="w-24">
              <div className="border-b border-black h-6"></div>
              <div className="text-center mt-1">Date</div>
            </div>
            <div className="flex-1">
              <div className="border-b border-black h-6"></div>
              <div className="text-center mt-1">Signature of Witness</div>
            </div>
          </div>
          
          <h4 className="font-bold mt-6">Witness Identification Information:</h4>
          <p className="text-sm mb-4">
            The following information for the witness named above must be completed prior to filing with the board of elections in order for this petition to be valid.
          </p>
          
          <div className="flex gap-8 mt-4">
            <div className="flex-1">
              <div className="border-b border-black h-6 flex items-center justify-center">
                {petitionData.witnessTown || ""}
              </div>
              <div className="text-center mt-1">Town or City Where Witness Resides</div>
            </div>
            <div className="flex-1">
              <div className="border-b border-black h-6 flex items-center justify-center">
                {petitionData.witnessCounty || ""}
              </div>
              <div className="text-center mt-1">County Where Witness Resides</div>
            </div>
          </div>
        </div>

        {petitionData.showNotary && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">2. Notary Public or Commissioner of Deeds:</h3>
            <p>
              On the dates above indicated before me personally came each of the voters whose signatures appear on this petition 
              sheet containing <span className="font-bold">{petitionData.notarySignatureCount || "_______"}</span> signatures, 
              who signed same in my presence and who, being by me duly sworn, each for himself or herself, said that the foregoing 
              statement made and subscribed by him or her was true.
            </p>
            
            <div className="flex gap-8 mt-6">
              <div className="w-24">
                <div className="border-b border-black h-6"></div>
                <div className="text-center mt-1">Date</div>
              </div>
              <div className="flex-1">
                <div className="border-b border-black h-6"></div>
                <div className="text-center mt-1">Signature and Official Title of Officer Administering Oath</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between text-sm mt-12">
          <div>DP - 01.2018</div>
          <div>(Sample prepared by the State Board of Elections)</div>
          <div>Sheet No. _________</div>
        </div>
      </div>
    </div>
  );
};
