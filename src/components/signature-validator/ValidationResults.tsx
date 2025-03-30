
import { AlertCircle } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";

export interface ValidationResultStats {
  total: number;
  valid: number;
  invalid: number;
  uncertain: number;
}

export interface MatchedVoter {
  state_voter_id: string;
  first_name: string;
  last_name: string;
  address?: string;
  district?: string;
}

export interface SignatureValidation {
  id: number | string;
  name: string;
  address: string;
  status: "valid" | "invalid" | "uncertain";
  matched_voter?: MatchedVoter;
  reason?: string;
  confidence?: number;
}

interface ValidationResultsProps {
  signatures: SignatureValidation[];
  stats: ValidationResultStats;
}

export function ValidationResults({ signatures, stats }: ValidationResultsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Signatures</div>
        </div>
        <div className="bg-green-50 p-4 rounded-md">
          <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
          <div className="text-sm text-green-600">Valid</div>
        </div>
        <div className="bg-red-50 p-4 rounded-md">
          <div className="text-2xl font-bold text-red-600">{stats.invalid}</div>
          <div className="text-sm text-red-600">Invalid</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="text-2xl font-bold text-yellow-600">{stats.uncertain}</div>
          <div className="text-sm text-yellow-600">Uncertain</div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Signature Details</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signatures.map((sig) => (
              <TableRow key={sig.id}>
                <TableCell className="font-medium">{sig.name}</TableCell>
                <TableCell>{sig.address}</TableCell>
                <TableCell>
                  {sig.status === "valid" && <span className="text-green-600 font-medium">Valid</span>}
                  {sig.status === "invalid" && <span className="text-red-600 font-medium">Invalid</span>}
                  {sig.status === "uncertain" && <span className="text-yellow-600 font-medium">Uncertain</span>}
                </TableCell>
                <TableCell>
                  {sig.status === "valid" && sig.matched_voter && (
                    <div className="text-sm">
                      Matched to voter ID: {sig.matched_voter.state_voter_id}
                    </div>
                  )}
                  {sig.status !== "valid" && sig.reason && (
                    <div className="text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1 inline" />
                      {sig.reason}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
