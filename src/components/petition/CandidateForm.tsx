
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CandidateFormProps } from "@/components/petition/types";
import { Search, Trash2 } from "lucide-react";

export function CandidateForm({ 
  candidate, 
  index, 
  onUpdate, 
  onRemove, 
  onSearch 
}: CandidateFormProps) {
  
  const handleChange = (field: string, value: string) => {
    onUpdate(index, {
      ...candidate,
      [field]: value
    });
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">
          Candidate {index + 1}
        </CardTitle>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`candidate-${index}-name`}>Full Name</Label>
            <div className="flex gap-2">
              <Input 
                id={`candidate-${index}-name`}
                value={candidate.name} 
                onChange={(e) => handleChange("name", e.target.value)} 
                placeholder="Full Name as Registered"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => onSearch(index)}
                title="Search Voter Database"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`candidate-${index}-position`}>
              Public Office or Party Position
            </Label>
            <Input 
              id={`candidate-${index}-position`}
              value={candidate.position} 
              onChange={(e) => handleChange("position", e.target.value)} 
              placeholder="e.g., State Assembly, 123rd District"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`candidate-${index}-residence`}>Residence Address</Label>
          <Input 
            id={`candidate-${index}-residence`}
            value={candidate.residence} 
            onChange={(e) => handleChange("residence", e.target.value)} 
            placeholder="Full Residential Address"
          />
        </div>
      </CardContent>
    </Card>
  );
}
