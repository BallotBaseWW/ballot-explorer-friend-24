import { RequestAccessForm } from "@/components/access/RequestAccessForm";
import LoginHeader from "@/components/auth/LoginHeader";

export default function RequestAccess() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <LoginHeader 
            heading="Request Access" 
            text="Fill out the form below to request access to BallotBase."
          />
          <RequestAccessForm />
        </div>
      </div>
    </div>
  );
}