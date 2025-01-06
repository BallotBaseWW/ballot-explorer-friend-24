import { CountySelector } from "@/components/CountySelector";
import { Header } from "@/components/Header";
import { AuthContainer } from "@/components/auth/AuthContainer";

const Index = () => {
  return (
    <AuthContainer>
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 pt-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#33C3F0] via-[#8E77B5] to-[#ea384c] bg-clip-text text-transparent">
                BallotBase
              </span>
            </h1>
            <p className="text-lg md:text-xl text-neutral">
              Modern Voter Information Platform
            </p>
          </div>
          <CountySelector />
        </main>
        <footer className="py-8 text-center text-neutral text-sm">
          <p>© 2024 BallotBase. All rights reserved.</p>
        </footer>
      </div>
    </AuthContainer>
  );
};

export default Index;