import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Tag } from "./types";

interface TagListProps {
  tags: Tag[];
  onRemoveTag: (tagId: string) => void;
}

export const TagList = ({ tags, onRemoveTag }: TagListProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          style={{ backgroundColor: tag.color }}
          className="flex items-center gap-1"
        >
          {tag.name}
          <button
            onClick={() => onRemoveTag(tag.id)}
            className="ml-1 hover:bg-black/20 rounded"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
};