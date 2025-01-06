import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { County } from "@/components/search/list-utils/types";

interface VoterInfo {
  state_voter_id: string;
  first_name: string;
  last_name: string;
  county: County;
}

interface InteractionFormProps {
  selectedVoter: VoterInfo;
  type: string;
  notes: string;
  onTypeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const InteractionForm = ({
  selectedVoter,
  type,
  notes,
  onTypeChange,
  onNotesChange,
  onSubmit,
  onBack,
  isSubmitting
}: InteractionFormProps) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="font-medium">
          Selected Voter: {selectedVoter.first_name} {selectedVoter.last_name}
        </p>
        <p className="text-sm text-muted-foreground">
          ID: {selectedVoter.state_voter_id} | County: {selectedVoter.county}
        </p>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="type">Interaction Type</Label>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="call">Phone Call</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="door_knock">Door Knock</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Enter any additional notes about the interaction..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Back to Search
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          Save Interaction
        </Button>
      </div>
    </div>
  );
};