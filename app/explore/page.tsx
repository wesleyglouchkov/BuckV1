import { auth, signOut } from "@/auth";

export default async function ExplorePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">Explore</h1>
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Discover Amazing Content
          </h2>
          <div className="flex gap-2">
            <input
              type="search"
              placeholder="Search content..."
              className="flex-1 rounded-lg border border-border bg-input px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-card rounded-lg shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-primary to-secondary"></div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Content Title {item}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This is a brief description of the content. It provides an
                  overview of what users can expect to find here.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    By Creator Name
                  </span>
                  <button className="text-sm text-primary hover:text-primary/80 font-medium">
                    View More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="rounded-lg border border-border bg-card px-6 py-2 text-sm font-semibold text-foreground hover:bg-accent">
            Load More
          </button>
        </div>
      </main>
    </div>
  );
}
