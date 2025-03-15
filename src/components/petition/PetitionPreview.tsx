
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
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Petition Preview</h2>
      <div className="space-y-2">
        <div className="text-lg font-bold">Political Party: {petitionData.party}</div>
        <div className="text-lg font-bold">Election Date: {petitionData.electionDate}</div>
        <div className="text-lg font-bold">Election Year: {petitionData.electionYear}</div>
        <div className="text-lg font-bold">Number of Signature Lines: {petitionData.signatureCount}</div>
      </div>

      {/* Candidates */}
      <div className="text-center font-bold mt-3 mb-1 uppercase">Candidates</div>
      <div className="border-solid border-black border-2 p-2 mb-3 text-sm">
        {petitionData.candidates.map((candidate) => (
          <div key={candidate.id} className="mb-1 leading-tight">
            {candidate.name}, {candidate.position}, residing at {candidate.residence}
          </div>
        ))}
      </div>

      {/* Committee to Fill Vacancies */}
      <div className="text-center font-bold mt-3 mb-1 uppercase">Committee to Fill Vacancies</div>
      <div className="border-solid border-black border-2 p-2 mb-3 text-sm">
        {renderCommitteeMembers()}
      </div>
    </div>
  );
}
