import React from "react";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

interface TagButtonProps {
  onClick: () => void;
}

export const TagButton = ({ onClick }: TagButtonProps) => (
  <Button 
    onClick={onClick}
    variant="outline"
    className="w-full"
  >
    <Tag className="h-4 w-4 mr-2" />
    Manage Tags
  </Button>
);