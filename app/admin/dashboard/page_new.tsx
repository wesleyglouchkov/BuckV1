"use client";

import { Button } from "@/components/ui";

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card p-6 shadow-md border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-primary">1,234</p>
        </div>

        <div className="bg-card p-6 shadow-md border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Active Creators
          </h3>
          <p className="text-3xl font-bold text-primary">567</p>
        </div>

        <div className="bg-card p-6 shadow-md border border-border">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Total Content
          </h3>
          <p className="text-3xl font-bold text-primary">8,901</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-card shadow-md border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground">
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="p-4 flex items-center justify-between hover:bg-accent transition-colors">
                <div>
                  <p className="font-medium text-foreground">User Activity {item}</p>
                  <p className="text-sm text-muted-foreground">Description of activity</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
