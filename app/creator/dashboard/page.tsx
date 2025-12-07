"use client";

import { Button } from "@/components/ui/button";
import { SkeletonStats, SkeletonCard, SkeletonBox } from "@/components/ui/skeleton-variants";
import { Plus, TrendingUp, DollarSign, User } from "lucide-react";
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

export default function CreatorDashboard() {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // SWR data fetching
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: chartData, error: chartError, isLoading: chartLoading } = useSWR('/api/creator/analytics', fetcher);
  const { data: statsData, error: statsError, isLoading: statsLoading } = useSWR('/api/creator/stats', fetcher);
  const { data: recentContent, error: contentError, isLoading: contentLoading } = useSWR('/api/creator/recent-content', fetcher);

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
    return session?.user?.name || session?.user?.email?.split('@')[0] || "Creator";
  };

  // Fallback chart data
  const fallbackFollowersData = useMemo(
    () => [
      { name: "Mon", value: 1050 },
      { name: "Tue", value: 1100 },
      { name: "Wed", value: 1150 },
      { name: "Thu", value: 1200 },
      { name: "Fri", value: 1350 },
      { name: "Sat", value: 1400 },
      { name: "Sun", value: 1550 },
    ],
    []
  );

  const fallbackRevenueData = useMemo(
    () => [
      { name: "Mon", value: 240 },
      { name: "Tue", value: 300 },
      { name: "Wed", value: 280 },
      { name: "Thu", value: 450 },
      { name: "Fri", value: 380 },
      { name: "Sat", value: 520 },
      { name: "Sun", value: 600 },
    ],
    []
  );

  return (
    <div className="p-6">
      {/* Greeting Section */}
      <div className="mb-6 flex items-center gap-4 bg-linear-to-r from-chart-4/5 to-chart-4/10 rounded-lg p-6 border border-border/20">
        <div className="w-20 h-20 bg-chart-4 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
          {getUserInitial()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{getGreeting()}, {getUserDisplayName()}!</h2>
          <p className="text-muted-foreground">Ready to create amazing content today?</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">Creator overview</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Content
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Followers Chart */}
          <div className="bg-card pt-6 pr-6 pb-6 rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4 px-6">
              <p className="text-lg font-semibold text-card-foreground">Followers Growth</p>
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div className="h-[300px] w-full">
              {chartLoading ? (
                <div className="h-full w-full px-6">
                  <SkeletonBox height="300px" className="w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fallbackFollowersData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <defs>
                      <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#followersGradient)"
                      dot={false}
                      activeDot={{ r: 5, stroke: "#3B82F6", strokeWidth: 2, fill: isDarkMode ? "#1F2937" : "#ffffff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-card pt-6 pr-6 pb-6 rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4 px-6">
              <p className="text-lg font-semibold text-card-foreground">Revenue Trend</p>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="h-[300px] w-full">
              {chartLoading ? (
                <div className="h-full w-full px-6">
                  <SkeletonBox height="300px" className="w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fallbackRevenueData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
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
                      cursor={{ stroke: "#10B981", strokeWidth: 1 }}
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
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                      dot={false}
                      activeDot={{ r: 5, stroke: "#10B981", strokeWidth: 2, fill: isDarkMode ? "#1F2937" : "#ffffff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
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
                  Total Views
                </h3>
                <p className="text-3xl font-bold text-primary">{statsData?.totalViews || "12.5K"}</p>
                <p className="text-sm text-muted-foreground mt-1">{statsData?.viewsChange || "+18% from last month"}</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border/20 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Published Content
                </h3>
                <p className="text-3xl font-bold text-primary">{statsData?.publishedContent || "47"}</p>
                <p className="text-sm text-muted-foreground mt-1">{statsData?.contentChange || "+3 this week"}</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border/20 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Engagement Rate
                </h3>
                <p className="text-3xl font-bold text-primary">{statsData?.engagementRate || "8.2%"}</p>
                <p className="text-sm text-muted-foreground mt-1">{statsData?.engagementChange || "+2.1% from last month"}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-card rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-6 border-b border-border/20">
            <h3 className="text-lg font-semibold text-card-foreground">
              Recent Content
            </h3>
          </div>
          <div className="divide-y divide-border/20">
            {contentLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-primary/10 animate-pulse rounded mb-2 w-32"></div>
                    <div className="h-3 bg-primary/10 animate-pulse rounded w-24"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-primary/10 animate-pulse rounded mb-1 w-16"></div>
                    <div className="h-3 bg-primary/10 animate-pulse rounded w-20"></div>
                  </div>
                </div>
              ))
            ) : (
              (recentContent || [1, 2, 3, 4, 5]).map((item: any, index: number) => (
                <div key={item?.id || index} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">{item?.title || `Content Item ${index + 1}`}</p>
                    <p className="text-sm text-muted-foreground">{item?.publishedDate || "Published 2 days ago"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">{item?.views || "1.2K views"}</p>
                    <p className="text-xs text-muted-foreground">{item?.engagement || "85% engagement"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
