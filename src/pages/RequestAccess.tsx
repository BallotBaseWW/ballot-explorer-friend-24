import { RequestAccessForm } from "@/components/access/RequestAccessForm";
import { LoginHeader } from "@/components/auth/LoginHeader";

export default function RequestAccess() {
  return (
    <div className="container max-w-lg mx-auto py-8 px-4 min-h-screen">
      <LoginHeader />
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-6">Request Access</h1>
        <RequestAccessForm />
      </div>
    </div>
  );
}