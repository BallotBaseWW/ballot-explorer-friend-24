import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge variant={status === "A" ? "default" : "secondary"}>
      {status === "A" ? "Active" : "Inactive"}
    </Badge>
  );
};