import UserProfile from "@/components/UserProfile";

export default function AdminProfilePage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings and change your password
        </p>
      </div>
      <UserProfile />
    </div>
  );
}
