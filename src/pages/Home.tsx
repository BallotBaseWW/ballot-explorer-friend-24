import { Header } from "@/components/Header";

export const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Welcome to BallotBase</h1>
        <p className="mt-4 text-gray-600">
          Search and manage voter information with ease.
        </p>
      </main>
    </div>
  );
};

export default Home;