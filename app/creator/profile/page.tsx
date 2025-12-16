import UserProfile from "@/components/UserProfile";
import StripeConnectSection from "@/components/StripeConnectSection";
import HelpSupportSidebar from "@/components/HelpSupportSidebar";

export default function CreatorProfilePage() {
  return (
    <div className="container dark:bg-background mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Creator Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings, payments, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2">
          <UserProfile />
        </div>

        {/* Sidebar - Creator-specific */}
        <div className="space-y-6">
          {/* Stripe Connect Section */}
          <StripeConnectSection isCreator={true} />

          {/* Help & Support */}
          <HelpSupportSidebar />
        </div>
      </div>
    </div>
  );
}
