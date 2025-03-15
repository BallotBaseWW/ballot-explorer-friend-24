
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CommitteeMemberFormProps } from "./types";
import { Search, Trash2 } from "lucide-react";

export function CommitteeMemberForm({ 
  member, 
  index, 
  onUpdate, 
  onRemove,
  onSearch
}: CommitteeMemberFormProps) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Committee Member {index + 1}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-destructive h-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                placeholder="Full Name"
                value={member.name}
                onChange={(e) => onUpdate(index, { ...member, name: e.target.value })}
              />
            </div>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={onSearch}
            >
              <Search className="h-4 w-4" />
              Find Voter
            </Button>
          </div>
          
          <Input
            placeholder="Residence Address"
            value={member.residence}
            onChange={(e) => onUpdate(index, { ...member, residence: e.target.value })}
          />
        </div>
      </div>
    </Card>
  );
}
