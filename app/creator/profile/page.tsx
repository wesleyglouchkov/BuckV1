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

          {/* Creator Dashboard Card */}
          <div className="bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Creator Dashboard
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Quick Stats</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-background/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground">Followers</p>
                    <p className="text-xl font-bold text-foreground">0</p>
                  </div>
                  <div className="bg-background/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground">Streams</p>
                    <p className="text-xl font-bold text-foreground">0</p>
                  </div>
                </div>
              </div>
              <a
                href="/creator/dashboard"
                className="block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Go to Creator Dashboard
              </a>
            </div>
          </div>

          {/* Help & Support */}
          <HelpSupportSidebar />
        </div>
      </div>
    </div>
  );
}
