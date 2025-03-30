
import { RequestAccessForm } from "@/components/access/RequestAccessForm";
import LoginHeader from "@/components/auth/LoginHeader";
import { Card } from "@/components/ui/card";

export default function RequestAccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <LoginHeader 
          heading="Request Access" 
          text="Fill out the form below to request access to BallotBase."
        />
        <Card className="p-6">
          <RequestAccessForm />
        </Card>
      </div>
    </div>
  );
}
