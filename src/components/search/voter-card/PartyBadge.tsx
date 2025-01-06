import { Badge } from "@/components/ui/badge";

interface PartyBadgeProps {
  party: string | null;
}

export const PartyBadge = ({ party }: PartyBadgeProps) => {
  const getPartyColor = (party: string | null) => {
    const colors: { [key: string]: string } = {
      REP: "bg-secondary hover:bg-secondary/90", // red
      DEM: "bg-primary hover:bg-primary/90", // blue
      CON: "bg-yellow-500 hover:bg-yellow-600", // gold
      WOR: "bg-purple-500 hover:bg-purple-600", // purple
      BLK: "bg-black hover:bg-black/90", // black
    };
    return colors[party || ""] || "bg-neutral hover:bg-neutral/90";
  };

  return (
    <Badge className={`${getPartyColor(party)} text-white`}>
      {party || "No Party"}
    </Badge>
  );
};