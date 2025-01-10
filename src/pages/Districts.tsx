import { useState } from "react";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface DistrictInfo {
  congressional?: string;
  stateSenate?: string;
  stateAssembly?: string;
  cityCouncil?: string;
}

const Districts = () => {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState<DistrictInfo | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/civicinfo/v2/representatives?key=${process.env.GOOGLE_CIVIC_API_KEY}&address=${encodeURIComponent(
          address + ", New York, NY"
        )}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch district information");
      }

      const districtInfo: DistrictInfo = {};
      
      data.divisions && Object.entries(data.divisions).forEach(([divisionId, division]: [string, any]) => {
        if (divisionId.includes("cd:")) {
          districtInfo.congressional = division.name;
        } else if (divisionId.includes("sldu:")) {
          districtInfo.stateSenate = division.name;
        } else if (divisionId.includes("sldl:")) {
          districtInfo.stateAssembly = division.name;
        } else if (divisionId.includes("council_district:")) {
          districtInfo.cityCouncil = division.name;
        }
      });

      setDistricts(districtInfo);
    } catch (error) {
      console.error("Error fetching district info:", error);
      toast({
        title: "Error",
        description: "Failed to fetch district information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">District Lookup</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-2">
                  Enter NYC Address
                </label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading || !address}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Look Up"
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {districts && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-4">District Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {districts.congressional && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Congressional District</h3>
                      <p>{districts.congressional}</p>
                    </div>
                  )}
                  {districts.stateSenate && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">State Senate District</h3>
                      <p>{districts.stateSenate}</p>
                    </div>
                  )}
                  {districts.stateAssembly && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">State Assembly District</h3>
                      <p>{districts.stateAssembly}</p>
                    </div>
                  )}
                  {districts.cityCouncil && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">City Council District</h3>
                      <p>{districts.cityCouncil}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Districts;