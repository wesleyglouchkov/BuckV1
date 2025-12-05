import { auth, signOut } from "@/auth";

export default async function AdminDashboard() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session?.user?.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-primary">1,234</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Active Creators
            </h3>
            <p className="text-3xl font-bold text-primary">567</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Total Content
            </h3>
            <p className="text-3xl font-bold text-primary">8,910</p>
          </div>
        </div>

        <div className="mt-8 bg-card p-6 rounded-lg shadow-md border border-border">
          <h2 className="text-xl font-bold text-card-foreground mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-medium text-foreground">New user registered</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <span className="text-sm text-primary">View</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-medium text-foreground">Content moderated</p>
                <p className="text-sm text-muted-foreground">5 hours ago</p>
              </div>
              <span className="text-sm text-primary">View</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">System backup completed</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
              <span className="text-sm text-primary">View</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
