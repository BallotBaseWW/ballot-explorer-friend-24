import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const NYS_OFFICES = [
  { value: "governor", label: "Governor" },
  { value: "lt-governor", label: "Lieutenant Governor" },
  { value: "attorney-general", label: "Attorney General" },
  { value: "comptroller", label: "Comptroller" },
  { value: "senate", label: "State Senate" },
  { value: "assembly", label: "State Assembly" },
] as const;

const NYC_OFFICES = [
  { value: "mayor", label: "Mayor" },
  { value: "public-advocate", label: "Public Advocate" },
  { value: "comptroller", label: "Comptroller" },
  { value: "borough-president", label: "Borough President" },
  { value: "city-council", label: "City Council" },
] as const;

type NYSOffice = (typeof NYS_OFFICES)[number]["value"];
type NYCOffice = (typeof NYC_OFFICES)[number]["value"];

export function MatchingFundsCalculator() {
  const [nysOffice, setNysOffice] = useState<NYSOffice>("governor");
  const [nycOffice, setNycOffice] = useState<NYCOffice>("mayor");
  const [nysAmount, setNysAmount] = useState("");
  const [nycAmount, setNycAmount] = useState("");

  const calculateNYSMatch = (amount: number, office: NYSOffice) => {
    if (amount < 5 || amount > 250) return 0;

    if (["governor", "lt-governor", "attorney-general", "comptroller"].includes(office)) {
      return Math.min(amount * 6, 1500);
    } else {
      let match = 0;
      if (amount > 0) {
        const firstTier = Math.min(amount, 50);
        match += firstTier * 12;
        
        if (amount > 50) {
          const secondTier = Math.min(amount - 50, 100);
          match += secondTier * 9;
          
          if (amount > 150) {
            const thirdTier = Math.min(amount - 150, 100);
            match += thirdTier * 8;
          }
        }
      }
      return Math.min(match, 2550);
    }
  };

  const calculateNYCMatch = (amount: number, office: NYCOffice) => {
    const maxMatchable = ["mayor", "public-advocate", "comptroller"].includes(office) 
      ? 250 
      : 175;
    
    if (amount < 5 || amount > maxMatchable) return 0;
    
    const matchableAmount = Math.min(amount, maxMatchable);
    return matchableAmount * 8;
  };

  const handleNYSAmountChange = (value: string) => {
    const numValue = value === "" ? "" : Math.min(Number(value), 250).toString();
    setNysAmount(numValue);
  };

  const handleNYCAmountChange = (value: string) => {
    const maxAmount = ["mayor", "public-advocate", "comptroller"].includes(nycOffice) 
      ? 250 
      : 175;
    const numValue = value === "" ? "" : Math.min(Number(value), maxAmount).toString();
    setNycAmount(numValue);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Matching Funds Calculator
        </h2>
        <p className="text-muted-foreground">
          Calculate the impact of your contribution with public matching funds
        </p>
      </div>

      <Tabs defaultValue="nys" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nys">New York State</TabsTrigger>
          <TabsTrigger value="nyc">New York City</TabsTrigger>
        </TabsList>

        <TabsContent value="nys">
          <Card className="p-6 bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-800 dark:to-gray-900">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Office</label>
                <Select value={nysOffice} onValueChange={(value: NYSOffice) => setNysOffice(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NYS_OFFICES.map((office) => (
                      <SelectItem key={office.value} value={office.value}>
                        {office.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contribution Amount ($)</label>
                <Input
                  type="number"
                  min="5"
                  max="250"
                  value={nysAmount}
                  onChange={(e) => handleNYSAmountChange(e.target.value)}
                  placeholder="Enter amount (5-250)"
                />
              </div>

              {nysAmount && Number(nysAmount) >= 5 && (
                <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 space-y-2">
                  <div className="flex justify-between">
                    <span>Your Contribution:</span>
                    <span className="font-semibold">${Number(nysAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Public Match:</span>
                    <span className="font-semibold text-primary">
                      ${calculateNYSMatch(Number(nysAmount), nysOffice).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span>Total Impact:</span>
                    <span className="font-bold text-lg">
                      ${(Number(nysAmount) + calculateNYSMatch(Number(nysAmount), nysOffice)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="nyc">
          <Card className="p-6 bg-gradient-to-br from-[#accbee] to-[#e7f0fd] dark:from-gray-800 dark:to-gray-900">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Office</label>
                <Select value={nycOffice} onValueChange={(value: NYCOffice) => setNycOffice(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NYC_OFFICES.map((office) => (
                      <SelectItem key={office.value} value={office.value}>
                        {office.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contribution Amount ($)</label>
                <Input
                  type="number"
                  min="5"
                  max={["mayor", "public-advocate", "comptroller"].includes(nycOffice) ? "250" : "175"}
                  value={nycAmount}
                  onChange={(e) => handleNYCAmountChange(e.target.value)}
                  placeholder="Enter amount (5-250)"
                />
              </div>

              {nycAmount && Number(nycAmount) >= 5 && (
                <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 space-y-2">
                  <div className="flex justify-between">
                    <span>Your Contribution:</span>
                    <span className="font-semibold">${Number(nycAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Public Match:</span>
                    <span className="font-semibold text-primary">
                      ${calculateNYCMatch(Number(nycAmount), nycOffice).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span>Total Impact:</span>
                    <span className="font-bold text-lg">
                      ${(Number(nycAmount) + calculateNYCMatch(Number(nycAmount), nycOffice)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}