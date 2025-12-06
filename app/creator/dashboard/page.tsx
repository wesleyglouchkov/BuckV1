"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui";

export default function CreatorDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">
                Creator Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session?.user?.email}
              </span>
              <form
                action={() => signOut({ callbackUrl: "/" })}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  type="submit"
                >
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Total Posts
            </h3>
            <p className="text-3xl font-bold text-primary">42</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Followers
            </h3>
            <p className="text-3xl font-bold text-primary">1,234</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Views
            </h3>
            <p className="text-3xl font-bold text-primary">15,678</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Engagement
            </h3>
            <p className="text-3xl font-bold text-primary">89%</p>
          </div>
        </div>

        <div className="mt-8 bg-card p-6 rounded-lg shadow-md border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-card-foreground">
              Your Content
            </h2>
            <Button>Create New Post</Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-medium text-foreground">Introduction to Buck V1</p>
                <p className="text-sm text-muted-foreground">Published 2 days ago</p>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-primary cursor-pointer hover:underline">Edit</span>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-medium text-foreground">Advanced Features Guide</p>
                <p className="text-sm text-muted-foreground">Published 5 days ago</p>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-primary cursor-pointer hover:underline">Edit</span>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Tips and Tricks</p>
                <p className="text-sm text-muted-foreground">Published 1 week ago</p>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-primary cursor-pointer hover:underline">Edit</span>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
