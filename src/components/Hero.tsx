import { SearchBar } from "./SearchBar";

export const Hero = () => {
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // Will be implemented when we add Supabase integration
  };

  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 -z-10" />
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        BallotBase
      </h1>
      <p className="text-lg md:text-xl text-neutral mb-8 text-center max-w-2xl">
        Search and discover voter information with ease
      </p>
      <SearchBar onSearch={handleSearch} />
      <div className="mt-8 text-sm text-neutral text-center">
        <p>Connect Supabase to enable voter search functionality</p>
      </div>
    </div>
  );
};