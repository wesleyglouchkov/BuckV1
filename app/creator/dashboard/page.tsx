"use client";

import { Button } from "@/components/ui/button";
import { SkeletonStats, SkeletonBox } from "@/components/ui/skeleton-variants";
import { Plus, TrendingUp, DollarSign, User, Video, X, Copy, Play } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { creatorService } from "@/services/creator";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, } from "recharts";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { CreateContentDialog } from "@/components/creator/CreateContentDialog";
import { formatDateTime } from "@/utils/dateTimeUtils";
import ModerationVideoPlayer from "@/components/admin/ModerationVideoPlayer";
import { getSignedStreamUrl } from "@/app/actions/s3-actions";
import { VideoSnapshot } from "@/lib/s3/video-thumbnail";
import { useSignedThumbnails } from "@/hooks/use-signed-thumbnails";
import { Loader2 } from "lucide-react";
import { useGetLiveTour } from "@/hooks/use-onboarding-tours";

export default function CreatorDashboard() {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedReplay, setSelectedReplay] = useState<any>(null);
  const [signedReplayUrl, setSignedReplayUrl] = useState<string>("");
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);

  // Get Live Tour
  const { startTour: startGetLiveTour } = useGetLiveTour();

  const handleReplayClick = async (stream: any) => {
    setSelectedReplay(stream);
    setIsGeneratingUrl(true);
    setSignedReplayUrl("");

    try {
      if (stream.replayUrl) {
        const url = await getSignedStreamUrl(stream.replayUrl);
        setSignedReplayUrl(url || "");
      }
    } catch (error) {
      toast.error("Failed to generate playback URL");
      console.error(error);
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  // SWR data fetching using creatorService
  const { data: dashboardResponse, error: dashboardError, isLoading: dashboardLoading } = useSWR('creator-dashboard',
    () => creatorService.getDashboardData(),
    { revalidateOnFocus: false }
  );

  const dashboardData = dashboardResponse?.data;
  const recentStreams = dashboardData?.recentStreams || [];
  const signedThumbnails = useSignedThumbnails(recentStreams);

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

  // Start Get Live tour after dashboard loads
  useEffect(() => {
    if (!dashboardLoading && dashboardData) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startGetLiveTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [dashboardLoading, dashboardData, startGetLiveTour]);

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
      <div className="mb-6 flex items-center gap-4 bg-linear-to-r from-primary/5 to-secondary/5  p-6 border border-border/20">
        <UserAvatar src={session?.user?.avatar || ''} size="xl" name={session?.user?.name || 'Creator'} />
        <div>
          <h2 className="text-xl font-bold text-foreground">{getGreeting()}, {getUserDisplayName()}!</h2>
          <p className="text-muted-foreground">Ready to create amazing content today?</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">Creator overview</p>
        </div>
        <CreateContentDialog>
          <div className="animated-border-btn" data-tour="get-live-btn">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Get Live
            </Button>
          </div>
        </CreateContentDialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Followers & Subscribers Chart */}
          <div className="bg-card pt-6 pr-6 pb-6  border border-border/30 shadow-sm hover:shadow-md transition-shadow">
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
          <div className="bg-card pt-6 pr-6 pb-6  border border-border/30 shadow-sm hover:shadow-md transition-shadow">
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
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
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
              <div className="bg-card p-6  border border-border/20 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Total Followers
                </h3>
                <p className="text-3xl font-bold text-primary">{dashboardData?.totalFollowers || "0"}</p>
                <div className="flex items-center text-sm text-green-500 mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Growing</span>
                </div>
              </div>

              <div className="bg-card p-6  border border-border/20 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Active Subscribers
                </h3>
                <p className="text-3xl font-bold text-primary">{dashboardData?.totalSubscribers || "0"}</p>
                <p className="text-sm text-muted-foreground mt-1">Monthly recurring</p>
              </div>

              <div className="bg-card p-6  border border-border/20 shadow-sm hover:shadow-md transition-shadow">
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
        <div className="bg-card  border border-border/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
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
                <div key={item?.id || index} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:bg-accent/50 transition-colors">
                  {/* Thumbnail - Full width on mobile, fixed on desktop */}
                  <div
                    className={`w-full sm:w-28 aspect-video sm:aspect-16/10 bg-muted overflow-hidden cursor-pointer relative shrink-0 group ${item.replayUrl ? 'cursor-pointer' : ''}`}
                    onClick={() => handleReplayClick(item)}
                  >
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        width={200}
                        height={120}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary transition-colors group-hover:bg-secondary/80">
                        {item.replayUrl && signedThumbnails[item.id] ? (
                          <VideoSnapshot
                            src={signedThumbnails[item.id]}
                            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                          />
                        ) : (
                          <Video className="w-8 h-8 sm:w-6 sm:h-6 text-muted-foreground dark:text-white" />
                        )}
                      </div>
                    )}

                    {/* Hover/Tap Overlay */}
                    {item.replayUrl && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity duration-200">
                        <Play className="w-10 h-10 sm:w-8 sm:h-8 text-white fill-white opacity-90" />
                      </div>
                    )}

                    {/* Viewers Badge - Shown on thumbnail for mobile */}
                    <div className="absolute bottom-2 right-2 sm:hidden flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1">
                      <User className="w-3 h-3 text-white" />
                      <span className="text-xs font-medium text-white">{item?.viewerCount || 0}</span>
                    </div>
                  </div>

                  {/* Content Info + Stats Row */}
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-foreground line-clamp-1 sm:truncate">{item?.title || "Untitled Stream"}</p>
                        {item.workoutType && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-medium border border-primary/20 shrink-0">
                            {item.workoutType}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item?.startTime ? formatDateTime(item.startTime) : "Date not available"}
                      </p>
                    </div>

                    {/* Right Side Stats/Actions - Hidden on mobile, shown in thumbnail badge instead */}
                    <div className="hidden sm:block text-right shrink-0">
                      <div className="flex items-center justify-end gap-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">{item?.viewerCount || 0} {item?.viewerCount < 2 ? "Viewer" : "Viewers"}</p>
                      </div>
                    </div>
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
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0  shadow-2xl bg-background border border-border">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-border/20 flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {selectedReplay?.title || "Stream Replay"}
              {selectedReplay?.workoutType && (
                <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 border border-border/50">
                  {selectedReplay.workoutType}
                </span>
              )}
            </DialogTitle>
            <button
              onClick={() => setSelectedReplay(null)}
              className="absolute right-4 top-4  opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-1 hover:bg-muted"
            >
              <X className="h-4 w-4 dark:text-white cursor-pointer" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="overflow-y-auto px-6 pb-6 flex-1">
            {selectedReplay?.replayUrl ? (
              <div className="w-full space-y-4">
                {isGeneratingUrl ? (
                  <div className="w-full aspect-video flex flex-col items-center justify-center bg-black  border-2 border-primary/30">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    <p className="text-primary text-sm font-medium">Generating secure link...</p>
                  </div>
                ) : (
                  <>
                    <div className=" overflow-hidden ring-1 ring-border/20 shadow-sm">
                      <ModerationVideoPlayer
                        src={signedReplayUrl}
                        title={selectedReplay.title}
                        poster={selectedReplay.thumbnail}
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/40  border border-border/40">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Secure Link to share valid for 2 hrs:</p>
                      <code className="select-none text-[10px] sm:text-xs text-muted-foreground truncate flex-1 font-mono  px-2 py-1 rounded ">
                        {signedReplayUrl}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(signedReplayUrl);
                          toast.success("Replay URL copied to clipboard");
                        }}
                        className="p-2 hover:bg-background  transition-all shadow-sm border border-transparent hover:border-border/30 text-muted-foreground hover:text-foreground"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4 cursor-pointer" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Video className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">No replay available</p>
                <p className="text-sm opacity-70">This stream does not have a recorded replay.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
