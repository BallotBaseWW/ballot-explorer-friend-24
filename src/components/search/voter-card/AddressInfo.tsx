import { MapPin } from "lucide-react";

interface AddressInfoProps {
  house: string | null;
  houseSuffix: string | null;
  preStDirection: string | null;
  streetName: string | null;
  postStDirection: string | null;
  aptunitType: string | null;
  unitNo: string | null;
  residenceCity: string | null;
  zipCode: string | null;
  zipFour: string | null;
}

export const AddressInfo = ({
  house,
  houseSuffix,
  preStDirection,
  streetName,
  postStDirection,
  aptunitType,
  unitNo,
  residenceCity,
  zipCode,
  zipFour,
}: AddressInfoProps) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <MapPin className="h-4 w-4" />
      <p>
        {house} {houseSuffix} {preStDirection} {streetName} {postStDirection}
        {aptunitType && `, ${aptunitType}`}
        {unitNo && ` ${unitNo}`}, {residenceCity},{" "}
        {zipCode}
        {zipFour && `-${zipFour}`}
      </p>
    </div>
  );
};