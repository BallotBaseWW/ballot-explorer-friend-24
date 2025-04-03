
import { PetitionData } from "./types";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function PetitionPreview({ petitionData }: { petitionData: PetitionData }) {
  const renderCommitteeMembers = () => {
    if (petitionData.committeeMembers && petitionData.committeeMembers.length > 0) {
      return (
        <div className="px-4 py-3">
          {petitionData.committeeMembers.map((member, index) => (
            <div key={member.id} className="mb-1 leading-tight">
              {member.name}, residing at {member.residence}
              {index < petitionData.committeeMembers.length - 1 && "; "}
            </div>
          ))}
        </div>
      );
    } else if (petitionData.committee) {
      return <div className="px-4 py-3">{petitionData.committee}</div>;
    }
    return <div className="px-4 py-3 text-gray-500 italic">No committee members added</div>;
  };
  
  // Generate signature lines based on signatureCount
  const renderSignatureLines = () => {
    const lines = [];
    for (let i = 0; i < Math.min(petitionData.signatureCount, 50); i++) {
      lines.push(
        <TableRow key={i}>
          <TableCell className="border border-black p-2 w-[15%]">
            {i+1}. __/__/20__
          </TableCell>
          <TableCell className="border border-black p-2 w-[35%]">
            <div className="h-8"></div>
            <div className="text-xs border-t border-dashed pt-1">Printed Name →</div>
          </TableCell>
          <TableCell className="border border-black p-2 w-[35%]"></TableCell>
          <TableCell className="border border-black p-2 w-[15%]"></TableCell>
        </TableRow>
      );
    }
    return lines;
  };
  
  return (
    <div className="space-y-4 p-4 bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{petitionData.party ? `${petitionData.party} PARTY DESIGNATING PETITION` : "Designating Petition"}</h1>
        <p className="text-sm">(Sec. 6-132, Election Law)</p>
      </div>
      
      <div className="text-sm leading-relaxed">
        I, the undersigned, do hereby state that I am a duly enrolled voter of the 
        <span className="mx-1 px-2 border-b border-gray-400 inline-block min-w-[150px]">{petitionData.party || "________________"}</span> 
        Party and entitled to vote at the next primary election of such party, to be held on 
        <span className="mx-1 px-2 border-b border-gray-400 inline-block min-w-[150px]">{petitionData.electionDate || "________________"}</span>, 
        20<span className="mx-1 px-1 border-b border-gray-400 inline-block min-w-[30px]">{petitionData.electionYear?.substring(2) || "__"}</span>; 
        that my place of residence is truly stated opposite my signature hereto, and I do hereby designate the following named person (or persons) as a candidate (or candidates) for the nomination of such party for public office or for election to a party position of such party.
      </div>
      
      {/* Candidates Table */}
      <div className="border border-black">
        <Table className="border-collapse w-full m-0 p-0">
          <TableHead>
            <TableRow>
              <TableHeader className="border border-black font-bold text-left p-2 w-[30%] text-gray-600 bg-gray-100">
                Name(s) of Candidate(s)
              </TableHeader>
              <TableHeader className="border border-black font-bold text-left p-2 w-[35%] text-gray-600 bg-gray-100">
                Public Office or Party Position
                <div className="text-xs font-normal italic">(Include district number, if applicable)</div>
              </TableHeader>
              <TableHeader className="border border-black font-bold text-left p-2 w-[35%] text-gray-600 bg-gray-100">
                Residence Address
                <div className="text-xs font-normal italic">(Also post office address if not identical)</div>
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {petitionData.candidates.map(candidate => (
              <TableRow key={candidate.id}>
                <TableCell className="border border-black p-2 font-medium">{candidate.name}</TableCell>
                <TableCell className="border border-black p-2">{candidate.position}</TableCell>
                <TableCell className="border border-black p-2">{candidate.residence}</TableCell>
              </TableRow>
            ))}
            {petitionData.candidates.length === 0 && (
              <TableRow>
                <TableCell className="border border-black p-2" colSpan={3}>
                  <div className="text-center text-gray-500 italic py-2">No candidates added yet</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Committee to Fill Vacancies */}
      <div>
        <div className="text-sm mb-1">
          I do hereby appoint as a committee to fill vacancies in accordance with the provisions of the election law 
          <span className="italic">(here insert the names and addresses of at least three persons, all of whom shall be enrolled voters of said party)</span>:
        </div>
        <Card className="border border-black rounded-none">
          {renderCommitteeMembers()}
        </Card>
      </div>
      
      <div className="text-sm">
        In witness whereof, I have hereunto set my hand, the day and year placed opposite my signature.
      </div>
      
      {/* Signature Table */}
      <div className="border border-black">
        <Table className="border-collapse w-full m-0 p-0">
          <TableHead>
            <TableRow>
              <TableHeader className="border border-black font-bold text-left p-2 w-[15%] text-gray-600 bg-gray-100">
                Date
              </TableHeader>
              <TableHeader className="border border-black font-bold text-left p-2 w-[35%] text-gray-600 bg-gray-100">
                Name of Signer
                <div className="text-xs font-normal italic">(Signature required. Printed name may be added)</div>
              </TableHeader>
              <TableHeader className="border border-black font-bold text-left p-2 w-[35%] text-gray-600 bg-gray-100">
                Residence
              </TableHeader>
              <TableHeader className="border border-black font-bold text-left p-2 w-[15%] text-gray-600 bg-gray-100">
                Enter Town or City
                <div className="text-xs font-normal italic">(Except in NYC enter county)</div>
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderSignatureLines()}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-center text-xs italic">
        (You may use fewer or more signature lines - this is only to show format.)
      </div>
      
      <div className="border border-black p-4">
        <div className="text-center font-bold mb-4">Complete ONE of the following</div>
        
        {petitionData.showWitness && (
          <div className="mb-6">
            <p className="font-bold mb-2">1. Statement of Witness:</p>
            <p className="text-sm mb-2">
              I <span className="italic">(name of witness)</span> _____________________ state: I am a duly qualified voter of the State of New York and
              am an enrolled voter of the ___________________ Party.
            </p>
            <p className="text-sm mb-2">
              I now reside at <span className="italic">(residence address)</span> _____________________.
            </p>
            <p className="text-sm mb-2">
              Each of the individuals whose names are subscribed to this petition sheet containing <span className="italic">(fill in number)</span> ___________ signatures, subscribed the
              same in my presence on the dates above indicated and identified himself or herself to be the individual who signed this sheet.
            </p>
            <p className="text-sm mb-4">
              I understand that this statement will be accepted for all purposes as the equivalent of an affidavit and, if it contains a material false
              statement, shall subject me to the same penalties as if I had been duly sworn.
            </p>
            
            <div className="flex justify-between mb-4">
              <div className="border-t border-black w-1/4">
                <div className="text-sm text-center pt-1">Date</div>
              </div>
              <div className="border-t border-black w-1/2">
                <div className="text-sm text-center pt-1">Signature of Witness</div>
              </div>
            </div>
            
            <p className="font-bold text-sm mb-2">Witness Identification Information:</p>
            <p className="text-sm mb-2">
              The following information for the witness named above must be completed prior to filing with the board
              of elections in order for this petition to be valid.
            </p>
            
            <div className="flex justify-between">
              <div className="border-t border-black w-2/5">
                <div className="text-sm text-center pt-1">Town or City Where Witness Resides</div>
              </div>
              <div className="border-t border-black w-2/5">
                <div className="text-sm text-center pt-1">County Where Witness Resides</div>
              </div>
            </div>
          </div>
        )}
        
        {petitionData.showNotary && (
          <div>
            <p className="font-bold mb-2">2. Notary Public or Commissioner of Deeds:</p>
            <p className="text-sm mb-4">
              On the dates above indicated before me personally came each of the voters whose signatures
              appear on this petition sheet containing <span className="italic">(fill in number)</span> ___________ signatures, who signed same in my presence and who, being by me duly
              sworn, each for himself or herself, said that the foregoing statement made and subscribed by him or her was true.
            </p>
            
            <div className="flex justify-between">
              <div className="border-t border-black w-1/4">
                <div className="text-sm text-center pt-1">Date</div>
              </div>
              <div className="border-t border-black w-2/3">
                <div className="text-sm text-center pt-1">Signature and Official Title of Officer Administering Oath</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-sm">
        <div>DP – 01.2018</div>
        <div className="italic">(Sample prepared by the State Board of Elections)</div>
        <div>Sheet No. _________</div>
      </div>
    </div>
  );
}
