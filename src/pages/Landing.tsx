import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ListTodo, MapPin, Calculator } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: "Advanced Search",
      description: "Powerful search capabilities across voter databases with filtering options.",
    },
    {
      icon: ListTodo,
      title: "List Management",
      description: "Create and manage custom voter lists for your campaigns.",
    },
    {
      icon: MapPin,
      title: "District Analysis",
      description: "Analyze voter data by districts and geographical regions.",
    },
    {
      icon: Calculator,
      title: "Matching Funds",
      description: "Calculate and track matching funds for campaign finance.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#33C3F0] via-[#8E77B5] to-[#ea384c] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
              BallotBase
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto">
            Streamline your voter outreach and campaign management with powerful tools and insights
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/login")}
              className="bg-primary hover:bg-primary/90"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/request-access")}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              Request Access
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-colors"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
              Pricing Plans
            </span>
          </h2>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Title</TableHead>
                  <TableHead>Number of Seats</TableHead>
                  <TableHead>Month-to-Month Price</TableHead>
                  <TableHead>Annual Price</TableHead>
                  <TableHead>Annual Discount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Solo</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>$20.00</TableCell>
                  <TableCell>$216.00</TableCell>
                  <TableCell>10%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Grassroots</TableCell>
                  <TableCell>3*</TableCell>
                  <TableCell>$48.00</TableCell>
                  <TableCell>$518.40</TableCell>
                  <TableCell>10%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Organizational</TableCell>
                  <TableCell>10**</TableCell>
                  <TableCell>$130.00</TableCell>
                  <TableCell>$1,326.00</TableCell>
                  <TableCell>15%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 space-y-2 text-sm text-foreground/70">
            <p>*Additional seats on the Grassroots plan are $14 per month or $151.20 annually</p>
            <p>**Additional seats on the Organizational plan are $12 per month or $108.00 annually</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-foreground/60">
          <p>© 2024 BallotBase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}