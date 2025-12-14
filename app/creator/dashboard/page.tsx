"use client";

import { Button } from "@/components/ui/button";
import { SkeletonStats, SkeletonBox } from "@/components/ui/skeleton-variants";
import { Plus, TrendingUp, DollarSign, User, Video, X } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { creatorService } from "@/services/creator";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, } from "recharts";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

export default function CreatorDashboard() {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedReplay, setSelectedReplay] = useState<any>(null);

  // SWR data fetching using creatorService
  const { data: dashboardResponse, error: dashboardError, isLoading: dashboardLoading } = useSWR('creator-dashboard',
    () => creatorService.getDashboardData(),
    { revalidateOnFocus: false }
  );

  const dashboardData = dashboardResponse?.data;
  const recentStreams = dashboardData?.recentStreams || [];

  // Process data for charts
  const followersAndSubscribersData = useMemo(() => {
    if (!dashboardData?.creatorFollowersData || !dashboardData?.creatorSubscribersData) return [];

    return dashboardData.creatorFollowersData.map((item: any, index: number) => ({
      name: item.name,
      followers: item.value,
      subscribers: dashboardData.creatorSubscribersData[index]?.value || 0
    }));
  }, [dashboardData]);

  const revenueData = useMemo(() => {
    return dashboardData?.creatorDataRevenueData || [];
  }, [dashboardData]);

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

  const getUserDisplayName = () => {
    return session?.user?.name || session?.user?.email?.split('@')[0] || "Creator";
  };

  return (
    <div className="p-6">
      {/* Greeting Section */}
      <div className="mb-6 flex items-center gap-4 bg-linear-to-r from-primary/5 to-secondary/5 rounded-lg p-6 border border-border/20">
        <UserAvatar src={session?.user?.image || ''} size="xl" name={session?.user?.name || 'Creator'} />
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
          {/* Followers & Subscribers Chart */}
          <div className="bg-card pt-6 pr-6 pb-6 rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4 px-6">
              <p className="text-lg font-semibold text-foreground">Community Growth</p>
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div className="h-[300px] w-full">
              {dashboardLoading ? (
                <div className="h-full w-full px-6">
                  <SkeletonBox height="300px" className="w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={followersAndSubscribersData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                    <defs>
                      <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="subscribersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#F97316" stopOpacity={0.05} />
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
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        color: isDarkMode ? '#F9FAFB' : '#111827'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="followers"
                      name="Followers"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fill="url(#followersGradient)"
                      dot={false}
                      activeDot={{ r: 5, stroke: "#3B82F6", strokeWidth: 2, fill: isDarkMode ? "#1F2937" : "#ffffff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="subscribers"
                      name="Subscribers"
                      stroke="#F97316"
                      strokeWidth={3}
                      fill="url(#subscribersGradient)"
                      dot={false}
                      activeDot={{ r: 5, stroke: "#F97316", strokeWidth: 2, fill: isDarkMode ? "#1F2937" : "#ffffff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-card pt-6 pr-6 pb-6 rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4 px-6">
              <p className="text-lg font-semibold text-foreground">Revenue Trend</p>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="h-[300px] w-full">
              {dashboardLoading ? (
                <div className="h-full w-full px-6">
                  <SkeletonBox height="300px" className="w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
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
                      formatter={(value: number) => [`$${value}`, "Revenue"]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Revenue"
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
          {dashboardLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonStats key={i} />
            ))
          ) : (
            <>
              <div className="bg-card p-6 rounded-lg border border-border/20 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Total Followers
                </h3>
                <p className="text-3xl font-bold text-primary">{dashboardData?.totalFollowers || "0"}</p>
                <div className="flex items-center text-sm text-green-500 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Growing</span>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border/20 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Active Subscribers
                </h3>
                <p className="text-3xl font-bold text-primary">{dashboardData?.totalSubscribers || "0"}</p>
                <p className="text-sm text-muted-foreground mt-1">Monthly recurring</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border/20 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Total Streams
                </h3>
                <p className="text-3xl font-bold text-primary">{dashboardData?.totalStreams || "0"}</p>
                <p className="text-sm text-muted-foreground mt-1">Lifetime streams</p>
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
            {dashboardLoading ? (
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
              recentStreams.map((item: any, index: number) => (
                <div key={item?.id || index} className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors">
                  {/* Thumbnail */}
                  <div
                    className={`w-24 h-16 bg-muted cursor-pointer rounded-md overflow-hidden relative shrink-0 ${item.replayUrl ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    onClick={() => setSelectedReplay(item)}
                  >
                    {item.thumbnail ? (
                      <Image src={item.thumbnail} alt={item.title} width={100} height={100} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <Video className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground truncate">{item?.title || "Untitled Stream"}</p>
                      {item.workoutType && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {item.workoutType}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item?.startTime ? new Date(item.startTime).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : "Date not available"}
                    </p>
                  </div>

                  {/* Right Side Stats/Actions */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1 mb-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <p className="text-sm mt-1 font-medium text-foreground">{item?.viewerCount || 0} {item?.viewerCount < 2 ? "Viewer" : "Viewers"}</p>
                    </div>
                    {item.replayUrl && (
                      <a
                        href={item.replayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline block"
                      >
                        Watch Replay
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
            {(!recentStreams || recentStreams.length === 0) && !dashboardLoading && (
              <div className="p-8 text-center text-muted-foreground">
                No recent content found.
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Replay Modal */}
      <Dialog open={!!selectedReplay} onOpenChange={(open) => !open && setSelectedReplay(null)}>
        <DialogContent className="sm:max-w-3xl bg-card text-card-foreground border-border">
          <button
            onClick={() => setSelectedReplay(null)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogHeader>
            <DialogTitle>{selectedReplay?.title || "Stream Replay"}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            {selectedReplay?.replayUrl ? (
              <video
                src={selectedReplay.replayUrl}
                controls
                className="w-full h-full"
                autoPlay
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                No replay available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
