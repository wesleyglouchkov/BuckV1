"use client";

import { Button } from "@/components/ui/button";
import { SkeletonStats, SkeletonCard, SkeletonBox } from "@/components/ui/skeleton-variants";
import { Plus, TrendingUp } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // SWR data fetching
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: chartData, error: chartError, isLoading: chartLoading } = useSWR('/api/admin/analytics', fetcher);
  const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR('/api/admin/stats', fetcher);
  const { data: recentActivity, error: activityError, isLoading: activityLoading } = useSWR('/api/admin/recent-activity', fetcher);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getUserInitial = () => {
    const name = session?.user?.name;
    const email = session?.user?.email;
    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  const getUserDisplayName = () => {
    return session?.user?.name || session?.user?.email?.split('@')[0] || "User";
  };

  // Fallback chart data
  const fallbackChartData = useMemo(
    () => [
      { name: "Mon", value: 12 },
      { name: "Tue", value: 19 },
      { name: "Wed", value: 14 },
      { name: "Thu", value: 22 },
      { name: "Fri", value: 28 },
      { name: "Sat", value: 25 },
      { name: "Sun", value: 30 },
    ],
    []
  );

  return (
    <div className="p-6">
      {/* Greeting Section */}
      <div className="mb-6 flex items-center gap-4 bg-linear-to-r from-primary/5 to-secondary/5 rounded-lg p-6 border border-border/20">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-md">
          {getUserInitial()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{getGreeting()}, {getUserDisplayName()}!</h2>
          <p className="text-muted-foreground">Welcome back to your dashboard</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-muted-foreground text-lg">Admin overview</h1>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Chart - Full Width */}
        <div className="bg-card pt-6 pr-6 pb-6 rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4 px-6">
            <p className="text-lg font-semibold text-card-foreground">Users Growth</p>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="h-[300px] w-full">
            {chartLoading ? (
              <div className="h-full w-full px-6">
                <SkeletonBox height="300px" className="w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData || fallbackChartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={isDarkMode ? "#374151" : "#E5E7EB"} strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: isDarkMode ? "#9CA3AF" : "#6B7280", fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: isDarkMode ? "#9CA3AF" : "#6B7280", fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ stroke: "#3B82F6", strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: isDarkMode ? '#F9FAFB' : '#111827'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    fill="url(#blueGradient)"
                    dot={false}
                    activeDot={{ r: 5, stroke: "#3B82F6", strokeWidth: 2, fill: isDarkMode ? "#1F2937" : "#ffffff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stats Cards - 3 in one row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonStats key={i} />
            ))
          ) : (
            <>
              <div className="bg-card p-6 rounded-lg border border-border/20 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Total Users
                </h3>
                <p className="text-3xl font-bold text-primary">{statsData?.totalUsers || "1,234"}</p>
                <p className="text-sm text-muted-foreground mt-1">{statsData?.usersChange || "+12% from last month"}</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border/20 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Active Creators
                </h3>
                <p className="text-3xl font-bold text-primary">{statsData?.activeCreators || "567"}</p>
                <p className="text-sm text-muted-foreground mt-1">{statsData?.creatorsChange || "+8% from last month"}</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border/20 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Total Content
                </h3>
                <p className="text-3xl font-bold text-primary">{statsData?.totalContent || "8,901"}</p>
                <p className="text-sm text-muted-foreground mt-1">{statsData?.contentChange || "+15% from last month"}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-card rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-6 border-b border-border/20">
            <h3 className="text-lg font-semibold text-card-foreground">
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-border/20">
            {activityLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-primary/10 animate-pulse rounded mb-2 w-32"></div>
                    <div className="h-3 bg-primary/10 animate-pulse rounded w-48"></div>
                  </div>
                  <div className="h-8 w-16 bg-destructive/10 animate-pulse rounded"></div>
                </div>
              ))
            ) : (
              (recentActivity || [1, 2, 3, 4, 5]).map((item: any, index: number) => (
                <div key={item?.id || index} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">{item?.title || `User Activity ${index + 1}`}</p>
                    <p className="text-sm text-muted-foreground">{item?.description || "Description of activity"}</p>
                  </div>
                  <Button variant="destructive" size="sm" className="shadow-sm">
                    {item?.action || "Delete"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
