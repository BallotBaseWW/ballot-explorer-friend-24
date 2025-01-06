import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface CreateTagFormProps {
  onCreateTag: (name: string, color: string, category: string) => void;
}

export const CreateTagForm = ({ onCreateTag }: CreateTagFormProps) => {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#000000");
  const [newTagCategory, setNewTagCategory] = useState("");

  const handleSubmit = () => {
    if (newTagName) {
      onCreateTag(newTagName, newTagColor, newTagCategory);
      setNewTagName("");
      setNewTagColor("#000000");
      setNewTagCategory("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
        />
        <Input
          type="color"
          value={newTagColor}
          onChange={(e) => setNewTagColor(e.target.value)}
          className="w-20"
        />
      </div>
      <Input
        placeholder="Category (optional)"
        value={newTagCategory}
        onChange={(e) => setNewTagCategory(e.target.value)}
      />
      <Button
        onClick={handleSubmit}
        disabled={!newTagName}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Tag
      </Button>
    </div>
  );
};