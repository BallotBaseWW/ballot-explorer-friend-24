import { Hero } from "@/components/Hero";
import { RequestAccessForm } from "@/components/access/RequestAccessForm";

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-8 mb-8">
        <h2 className="text-2xl font-bold text-center mb-6">Request Access</h2>
        <RequestAccessForm />
      </div>
    </div>
  );
}