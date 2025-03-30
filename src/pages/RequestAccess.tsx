
import { RequestAccessForm } from "@/components/access/RequestAccessForm";
import LoginHeader from "@/components/auth/LoginHeader";
import { Card } from "@/components/ui/card";

export default function RequestAccess() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center px-4 py-6 pb-16 mb-8">
      <div className="w-full max-w-md space-y-6 mt-4">
        <LoginHeader 
          heading="Request Access" 
          text="Fill out the form below to request access to BallotBase."
        />
        <Card className="p-4 md:p-6 shadow-lg">
          <RequestAccessForm />
        </Card>
      </div>
    </div>
  );
}
