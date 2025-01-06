import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Phone, Mail, Users, Home } from "lucide-react";

const getInteractionIcon = (type: string) => {
  switch (type) {
    case "call":
      return <Phone className="h-4 w-4" />;
    case "email":
      return <Mail className="h-4 w-4" />;
    case "meeting":
      return <Users className="h-4 w-4" />;
    case "door_knock":
      return <Home className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getInteractionLabel = (type: string) => {
  switch (type) {
    case "call":
      return "Phone Call";
    case "email":
      return "Email";
    case "meeting":
      return "Meeting";
    case "door_knock":
      return "Door Knock";
    default:
      return "Other";
  }
};

const getVoterName = (interaction: any) => {
  const voter = interaction[interaction.county.toLowerCase()];
  if (!voter) return "Unknown Voter";
  return `${voter.first_name || ""} ${voter.last_name || ""}`.trim() || "Unknown Voter";
};

export const InteractionsList = ({ interactions }: { interactions: any[] }) => {
  return (
    <div className="space-y-4">
      {interactions.map((interaction) => (
        <Card key={interaction.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getInteractionIcon(interaction.type)}
                <h3 className="font-medium">
                  {getInteractionLabel(interaction.type)} with {getVoterName(interaction)}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(interaction.interaction_date), { addSuffix: true })}
              </p>
              {interaction.notes && (
                <p className="text-sm mt-2">{interaction.notes}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};