import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Share2 } from "lucide-react";

interface ListSelectorProps {
  lists: Array<{ id: string; name: string }>;
  onSelect: (listId: string) => void;
  onCreateNew: () => void;
  onShare?: (listId: string) => void;
  showShareButton?: boolean;
}

export function ListSelector({ 
  lists, 
  onSelect, 
  onCreateNew, 
  onShare,
  showShareButton = false 
}: ListSelectorProps) {
  const [selectedListId, setSelectedListId] = useState<string>("");

  return (
    <div className="space-y-4">
      {lists.length > 0 ? (
        <>
          <Select
            onValueChange={setSelectedListId}
            value={selectedListId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a list" />
            </SelectTrigger>
            <SelectContent>
              {lists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onCreateNew}
            >
              Create New List
            </Button>
            <div className="flex gap-2">
              {showShareButton && selectedListId && onShare && (
                <Button
                  variant="outline"
                  onClick={() => onShare(selectedListId)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share List
                </Button>
              )}
              <Button
                onClick={() => selectedListId && onSelect(selectedListId)}
                disabled={!selectedListId}
              >
                Add to Selected List
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No lists found. Create your first list.
          </p>
          <Button onClick={onCreateNew}>Create New List</Button>
        </div>
      )}
    </div>
  );
}