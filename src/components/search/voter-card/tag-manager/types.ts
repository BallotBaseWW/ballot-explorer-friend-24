export interface Tag {
  id: string;
  name: string;
  color: string;
  category: string | null;
}

export interface TagAssignment {
  id: string;
  tag_id: string;
}