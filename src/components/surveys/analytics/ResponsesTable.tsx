import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface ResponsesTableProps {
  responses: Array<{
    id: string;
    response: string;
    created_at: string;
    survey_questions: {
      question: string;
      question_type: string;
    };
  }>;
}

export const ResponsesTable = ({ responses }: ResponsesTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Response</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((response) => (
            <TableRow key={response.id}>
              <TableCell className="font-medium">
                {response.survey_questions.question}
              </TableCell>
              <TableCell>{response.response}</TableCell>
              <TableCell>
                {format(new Date(response.created_at), "MMM d, yyyy HH:mm")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};