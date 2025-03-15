
import { PetitionData } from "./types";

export function PetitionPreview({ petitionData }: { petitionData: PetitionData }) {
  const renderCommitteeMembers = () => {
    if (petitionData.committeeMembers && petitionData.committeeMembers.length > 0) {
      return petitionData.committeeMembers.map((member, index) => (
        <div key={member.id} className="mb-1 leading-tight">
          {member.name}, residing at {member.residence}
        </div>
      ));
    } else if (petitionData.committee) {
      return <div className="mb-2">{petitionData.committee}</div>;
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Petition Preview</h2>
      <div className="space-y-3">
        <div className="text-lg"><strong>Political Party:</strong> {petitionData.party}</div>
        <div className="text-lg"><strong>Election Date:</strong> {petitionData.electionDate}</div>
        <div className="text-lg"><strong>Election Year:</strong> {petitionData.electionYear}</div>
        <div className="text-lg"><strong>Number of Signature Lines:</strong> {petitionData.signatureCount}</div>
      </div>

      {/* Candidates */}
      <div className="text-center font-bold mt-6 mb-2 uppercase">CANDIDATES</div>
      <div className="border-solid border-black border-2 p-4">
        {petitionData.candidates.map((candidate) => (
          <div key={candidate.id} className="leading-relaxed">
            {candidate.name}{candidate.position ? `, ${candidate.position}` : ""}, residing at {candidate.residence}
          </div>
        ))}
      </div>

      {/* Committee to Fill Vacancies */}
      <div className="text-center font-bold mt-6 mb-2 uppercase">COMMITTEE TO FILL VACANCIES</div>
      <div className="border-solid border-black border-2 p-4">
        {renderCommitteeMembers()}
      </div>
    </div>
  );
}
