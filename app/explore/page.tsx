"use client";

import { useSession, signOut } from "next-auth/react";
import { Button, Input } from "@/components/ui";

export default function ExplorePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">Explore</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session?.user?.email}
              </span>
              <form action={() => signOut({ callbackUrl: "/" })}>
                <Button className="bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90">
                  Sign out
                </Button>
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
            <Input
              type="search"
              placeholder="Search content..."
              className="flex-1"
            />
            <Button className="bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Search
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-card rounded-lg border border-border/20 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-linear-to-br from-primary to-secondary"></div>
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
                  <Button className="text-sm text-primary hover:text-primary/80 font-medium">
                    View More
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" className="w-full">
            Load More
          </Button>
        </div>
      </main>
    </div>
  );
}
