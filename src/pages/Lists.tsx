import { Header } from "@/components/Header";

const Lists = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Lists</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Your saved voter lists will appear here.</p>
        </div>
      </main>
    </div>
  );
};

export default Lists;