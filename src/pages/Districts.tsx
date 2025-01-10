import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AuthContainer } from "@/components/auth/AuthContainer";
import { supabase } from "@/integrations/supabase/client";

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
  const autocompleteInput = useRef<HTMLInputElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { key: 'GOOGLE_CIVIC_API_KEY' }
        });

        if (error) {
          console.error('Error fetching API key:', error);
          toast({
            title: "Error",
            description: "Failed to load API key. Please try again later.",
            variant: "destructive",
          });
          return;
        }

        if (data?.GOOGLE_CIVIC_API_KEY) {
          setApiKey(data.GOOGLE_CIVIC_API_KEY);
          
          // Only load the script if it hasn't been loaded yet
          if (!window.google?.maps?.places) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${data.GOOGLE_CIVIC_API_KEY}&libraries=places`;
            script.async = true;
            script.onload = () => {
              setScriptLoaded(true);
            };
            document.body.appendChild(script);
          } else {
            setScriptLoaded(true);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to initialize the district lookup. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchApiKey();
  }, [toast]);

  useEffect(() => {
    if (scriptLoaded && autocompleteInput.current && apiKey) {
      const autocomplete = new google.maps.places.Autocomplete(
        autocompleteInput.current,
        {
          componentRestrictions: { country: "us" },
          types: ["address"],
          bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(40.4774, -74.2591),
            new google.maps.LatLng(40.9176, -73.7002)
          ),
          strictBounds: true,
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setAddress(place.formatted_address);
        }
      });

      return () => {
        google.maps.event.clearInstanceListeners(autocomplete);
      };
    }
  }, [scriptLoaded, apiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      toast({
        title: "Error",
        description: "API key not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/civicinfo/v2/representatives?key=${apiKey}&address=${encodeURIComponent(address)}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch district information");
      }

      const data = await response.json();
      const districtInfo: DistrictInfo = {};
      
      if (data.divisions) {
        Object.entries(data.divisions).forEach(([divisionId, division]: [string, any]) => {
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
      }

      setDistricts(districtInfo);
      
      if (Object.keys(districtInfo).length === 0) {
        toast({
          title: "No districts found",
          description: "No district information was found for this address.",
          variant: "destructive",
        });
      }
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
    <AuthContainer>
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
                      ref={autocompleteInput}
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter a New York City address"
                      className="flex-1"
                      autoComplete="off"
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
    </AuthContainer>
  );
};

export default Districts;