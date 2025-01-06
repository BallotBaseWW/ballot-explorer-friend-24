import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag } from "./types";

interface TagSelectorProps {
  availableTags: Tag[];
  onSelectTag: (tagId: string) => void;
}

export const TagSelector = ({ availableTags, onSelectTag }: TagSelectorProps) => {
  return (
    <Select onValueChange={onSelectTag}>
      <SelectTrigger>
        <SelectValue placeholder="Select a tag" />
      </SelectTrigger>
      <SelectContent>
        {availableTags.map((tag) => (
          <SelectItem key={tag.id} value={tag.id}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
              {tag.category && (
                <span className="text-muted-foreground">({tag.category})</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};