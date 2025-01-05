import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SearchResultsProps {
  results: any[];
}

export const SearchResults = ({ results }: SearchResultsProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Party</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Districts</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((voter, index) => (
          <TableRow key={`${voter.nys_state_voter_id}-${index}`}>
            <TableCell className="font-medium">
              {voter.first_name} {voter.middle} {voter.last_name} {voter.suffix}
            </TableCell>
            <TableCell>
              {[
                voter.house,
                voter.street_name,
                voter.city,
                voter.zip_code
              ].filter(Boolean).join(' ')}
            </TableCell>
            <TableCell>{voter.registered_party || 'N/A'}</TableCell>
            <TableCell>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                voter.voter_status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {voter.voter_status || 'UNKNOWN'}
              </span>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>ED: {voter.election_district || 'N/A'}</div>
                <div>CD: {voter.congressional_district || 'N/A'}</div>
                <div>AD: {voter.assembly_district || 'N/A'}</div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};