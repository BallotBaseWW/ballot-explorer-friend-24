import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
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

  const pricingPlans = [
    {
      title: "Solo",
      seats: "1",
      monthlyPrice: 20.00,
      annualPrice: 216.00,
      discount: "10%",
      features: [
        "1 User Seat",
        "Basic Search Features",
        "List Management",
      ],
      additionalSeats: null,
    },
    {
      title: "Grassroots",
      seats: "3",
      monthlyPrice: 48.00,
      annualPrice: 518.40,
      discount: "10%",
      popular: true,
      features: [
        "3 User Seats",
        "Advanced Search Features",
        "Enhanced List Management",
        "Priority Support",
      ],
      additionalSeats: {
        monthly: 14,
        annual: 151.20,
      },
    },
    {
      title: "Organizational",
      seats: "10",
      monthlyPrice: 130.00,
      annualPrice: 1326.00,
      discount: "15%",
      features: [
        "10 User Seats",
        "All Features Included",
        "Advanced Analytics",
        "24/7 Priority Support",
      ],
      additionalSeats: {
        monthly: 12,
        annual: 108.00,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.title}
                className={`relative p-8 rounded-2xl ${
                  plan.popular
                    ? "bg-gradient-to-b from-[#33C3F0] to-[#8E77B5] text-white transform scale-105 shadow-xl"
                    : "bg-gradient-to-b from-background to-muted/30 border border-border/50 hover:border-primary/50"
                } transition-all hover:shadow-lg`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-secondary px-3 py-1 rounded-tr-lg rounded-bl-lg text-xs font-semibold">
                    Popular
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
                  <p className={`text-sm ${plan.popular ? "opacity-90" : "text-foreground/70"} mb-4`}>
                    {plan.seats} User Seats
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-center items-baseline">
                      <span className="text-4xl font-bold">${plan.monthlyPrice}</span>
                      <span className={`${plan.popular ? "opacity-90" : "text-foreground/70"} ml-1`}>/month</span>
                    </div>
                    <div className="flex justify-center items-baseline text-sm">
                      <span className="font-semibold">${plan.annualPrice}</span>
                      <span className={`${plan.popular ? "opacity-90" : "text-foreground/70"} ml-1`}>/year</span>
                      <span className="ml-2 text-secondary-foreground">Save {plan.discount}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate("/request-access")}
                    variant={plan.popular ? "secondary" : "default"}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <span className="mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.additionalSeats && (
                  <div className="mt-4 pt-4 border-t border-border/20 text-sm">
                    <p>Additional seats:</p>
                    <p>${plan.additionalSeats.monthly}/month per seat</p>
                    <p>${plan.additionalSeats.annual}/year per seat</p>
                  </div>
                )}
              </div>
            ))}
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