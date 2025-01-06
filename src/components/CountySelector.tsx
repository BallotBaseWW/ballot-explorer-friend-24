import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const counties = [
  { id: "brooklyn", name: "Brooklyn" },
  { id: "queens", name: "Queens" },
  { id: "manhattan", name: "Manhattan" },
  { id: "bronx", name: "Bronx" },
  { id: "statenisland", name: "Staten Island" }
];

export const CountySelector = () => {
  const navigate = useNavigate();

  const handleCountySelect = (countyId: string) => {
    navigate(`/search/${countyId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Select a County</CardTitle>
          <CardDescription className="text-card-foreground/70">Choose a county to search for voters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {counties.map((county) => (
              <Button
                key={county.id}
                onClick={() => handleCountySelect(county.id)}
                variant="outline"
                className="h-24 text-lg bg-background/5 hover:bg-background/10 border-border/10"
              >
                {county.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};