import { User } from "lucide-react";
import { calculateAge } from "@/lib/utils";

interface PersonalInfoProps {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;
  dateOfBirth: string | null;
}

export const PersonalInfo = ({ 
  firstName, 
  middleName, 
  lastName, 
  suffix,
  dateOfBirth 
}: PersonalInfoProps) => {
  const age = dateOfBirth ? calculateAge(dateOfBirth) : null;

  return (
    <div className="flex items-center gap-2">
      <User className="h-4 w-4 text-muted-foreground" />
      <h3 className="font-medium">
        {firstName} {middleName} {lastName} {suffix}
        {age && <span className="text-muted-foreground ml-2">({age} years old)</span>}
      </h3>
    </div>
  );
};