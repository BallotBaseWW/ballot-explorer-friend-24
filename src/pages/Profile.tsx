import { Header } from "@/components/Header";

export const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-4 text-gray-600">
          Manage your account settings and preferences.
        </p>
      </main>
    </div>
  );
};

export default Profile;