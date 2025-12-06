"use client";

import { Button } from "@/components/ui";
import { Plus, TrendingUp } from "lucide-react";

export default function CreatorDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Manage your content and track performance</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-card p-6 shadow-md border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-card-foreground">
              Total Posts
            </h3>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">45</p>
          <p className="text-sm text-muted-foreground mt-1">+5 this month</p>
        </div>

        <div className="bg-card p-6 shadow-md border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-card-foreground">
              Total Views
            </h3>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">12.5K</p>
          <p className="text-sm text-muted-foreground mt-1">+2.3K this month</p>
        </div>

        <div className="bg-card p-6 shadow-md border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-card-foreground">
              Engagement
            </h3>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">89%</p>
          <p className="text-sm text-muted-foreground mt-1">+12% this month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card shadow-md border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground">
              Recent Content
            </h3>
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-4 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Content Title {item}</p>
                    <p className="text-sm text-muted-foreground">Published 2 days ago</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="destructive">Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card shadow-md border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground">
              Performance Analytics
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Impressions</span>
                  <span className="text-sm font-medium">15.2K</span>
                </div>
                <div className="w-full bg-secondary h-2">
                  <div className="bg-primary h-2" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Click Rate</span>
                  <span className="text-sm font-medium">8.5%</span>
                </div>
                <div className="w-full bg-secondary h-2">
                  <div className="bg-primary h-2" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Shares</span>
                  <span className="text-sm font-medium">234</span>
                </div>
                <div className="w-full bg-secondary h-2">
                  <div className="bg-primary h-2" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
