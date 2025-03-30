
import { AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { SignatureValidation, ValidationResultStats } from "./types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ValidationResultsProps {
  signatures: SignatureValidation[];
  stats: ValidationResultStats;
  selectedSignatureId?: string | number | null;
  onSignatureSelect?: (signature: SignatureValidation) => void;
}

export function ValidationResults({ 
  signatures, 
  stats, 
  selectedSignatureId = null,
  onSignatureSelect 
}: ValidationResultsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gray-50 p-3 md:p-4 rounded-md">
          <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Signatures</div>
        </div>
        <div className="bg-green-50 p-3 md:p-4 rounded-md">
          <div className="text-xl md:text-2xl font-bold text-green-600">{stats.valid}</div>
          <div className="text-sm text-green-600">Valid</div>
        </div>
        <div className="bg-red-50 p-3 md:p-4 rounded-md">
          <div className="text-xl md:text-2xl font-bold text-red-600">{stats.invalid}</div>
          <div className="text-sm text-red-600">Invalid</div>
        </div>
        <div className="bg-yellow-50 p-3 md:p-4 rounded-md">
          <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats.uncertain}</div>
          <div className="text-sm text-yellow-600">Uncertain</div>
        </div>
      </div>

      <div className="mt-6 md:mt-8 overflow-x-auto">
        <h3 className="text-lg font-medium mb-4">Signature Details</h3>
        <div className="min-w-full overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="w-20 md:w-28">Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signatures.map((sig) => (
                <TableRow 
                  key={sig.id} 
                  className={`cursor-pointer ${selectedSignatureId === sig.id ? 'bg-blue-50' : ''}`}
                  onClick={() => onSignatureSelect && onSignatureSelect(sig)}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[120px] md:max-w-full">{sig.name}</span>
                      {sig.page_number && (
                        <Badge variant="outline" className="mt-1 w-fit">Page {sig.page_number}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{sig.address}</TableCell>
                  <TableCell>
                    {sig.confidence !== undefined && (
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground">{Math.round(sig.confidence * 100)}%</div>
                        <Progress 
                          value={sig.confidence * 100} 
                          className={`h-2 ${
                            sig.confidence > 0.8 
                              ? 'bg-gray-100' 
                              : sig.confidence > 0.6 
                                ? 'bg-yellow-100' 
                                : 'bg-red-100'
                          }`}
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {sig.status === "valid" && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Valid
                      </Badge>
                    )}
                    {sig.status === "invalid" && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Invalid
                      </Badge>
                    )}
                    {sig.status === "uncertain" && (
                      <Badge variant="warning" className="flex items-center gap-1">
                        <HelpCircle className="h-3 w-3" /> Uncertain
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {sig.status === "valid" && sig.matched_voter && (
                      <div className="text-sm">
                        <div>Matched to: {sig.matched_voter.first_name} {sig.matched_voter.last_name}</div>
                        <div className="text-xs text-muted-foreground">ID: {sig.matched_voter.state_voter_id}</div>
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
    </div>
  );
}
