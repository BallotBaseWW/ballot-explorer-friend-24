import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

interface TagButtonProps {
  onClick: () => void;
}

export const TagButton = ({ onClick }: TagButtonProps) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    className="h-8"
  >
    <Tag className="h-4 w-4 mr-2" />
    Manage Tags
  </Button>
);