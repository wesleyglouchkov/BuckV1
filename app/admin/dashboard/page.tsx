"use client";

import { Button } from "@/components/ui/button";
import { SkeletonStats, SkeletonBox } from "@/components/ui/skeleton-variants";
import { Plus, TrendingUp, UserPlus, DollarSign, Award, Calendar, Mail, Star, User, FileText, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { adminService, TopCreator } from "@/services/admin";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserInfoDialog } from "@/components/admin/UserInfoDialog";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<TopCreator | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  // Single SWR data fetching for dashboard
  const { data: dashboardData, error, isLoading } = useSWR(
    '/admin/dashboard',
    () => adminService.getDashboard()
  );

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
    return session?.user?.name || session?.user?.email?.split('@')[0] || "User";
  };

  // Get chart data from API response
  const creatorsChartData = dashboardData?.data?.chart?.creators || [];
  const membersChartData = dashboardData?.data?.chart?.members || [];
  const statsData = dashboardData?.data?.stats.slice(0, 3) || [];
  const otherStatsData = dashboardData?.data?.stats.slice(3) || [];
  const recentSignupsData = dashboardData?.data?.recentSignups?.users || [];
  const recentSignupsCount = dashboardData?.data?.recentSignups?.count || 0;
  const topCreatorsData = dashboardData?.data?.topCreators || [];
  // Combine creators and members data for the chart
  const combinedChartData = creatorsChartData.map((creator, index) => ({
    name: creator.name,
    creators: creator.value,
    members: membersChartData[index]?.value || 0,
  }));

  // Helper function to format date
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    return date.toLocaleDateString();
  };

  const handleViewProfile = (creatorId: string) => {
    const creator = topCreatorsData.find(c => c.id === creatorId);
    if (creator) {
      setSelectedCreator(creator);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setSelectedCreator(null), 200); // Clear after animation
  };

  return (
    <div className="p-6">
      {/* Greeting Section */}
      <div className="mb-6 flex items-center gap-4 bg-linear-to-r from-primary/5 to-secondary/5  p-6 border border-border/20">
          <UserAvatar src={'/Wesley.jpg'} size="xl" name="Wesley"/>
        <div>
          <h2 className="text-xl font-bold text-foreground">{getGreeting()}, {getUserDisplayName()}!</h2>
          <p className="text-muted-foreground">Welcome back to your dashboard</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-muted-foreground text-lg">Admin overview</h1>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Chart - Full Width */}
        <div className="bg-card pt-6 pr-6 pb-6  border border-border/30 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4 px-6">
            <p className="text-lg font-semibold text-card-foreground">Users Growth</p>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="h-full w-full px-6">
                <SkeletonBox height="300px" className="w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedChartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
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
                    cursor={{ stroke: "#3B82F6", strokeWidth: 1 }}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'} `,
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: isDarkMode ? '#F9FAFB' : '#111827'
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '20px'
                    }}
                    iconType="line"
                  />
                  <Area
                    type="monotone"
                    dataKey="creators"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#blueGradient)"
                    dot={false}
                    activeDot={{ r: 5, stroke: "#3B82F6", strokeWidth: 2, fill: isDarkMode ? "#1F2937" : "#ffffff" }}
                    name="Creators"
                  />
                  <Area
                    type="monotone"
                    dataKey="members"
                    stroke="#F97316"
                    strokeWidth={3}
                    fill="url(#orangeGradient)"
                    dot={false}
                    activeDot={{ r: 5, stroke: "#F97316", strokeWidth: 2, fill: isDarkMode ? "#1F2937" : "#ffffff" }}
                    name="Members"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stats Cards - 3 in one row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonStats key={i} />
            ))
          ) : (
            statsData.map((stat, index) => (
              <div key={index} className="bg-card p-6  border border-border/20 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-primary">{stat.value.toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Creators Section */}
      <div className="mt-6">
        <div className="bg-card  border border-border/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-6 border-b border-border/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/10  flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  Top Creators
                </h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                router.push('/admin/users');
              }}>
                View All
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Followers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="h-6 w-6 bg-primary/10 animate-pulse rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 animate-pulse rounded-full"></div>
                          <div className="h-4 bg-primary/10 animate-pulse rounded w-32"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-primary/10 animate-pulse rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-primary/10 animate-pulse rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 w-20 bg-primary/10 animate-pulse rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  topCreatorsData.map((creator, index) => (
                    <tr key={creator.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 text-white font-bold text-sm">
                          {creator.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar src={creator.avatar} name={creator.name} size="md" />
                          <div>
                            <p className="font-medium text-foreground">{creator.name}</p>
                            <p className="text-sm text-muted-foreground">@{creator.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-foreground">{creator.followers.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-500">${creator.revenue.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProfile(creator.id)}
                        >
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Average Revenue Per Creator */}
        <div className="bg-card  border border-border/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-6 border-b border-border/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10  flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Avg Revenue Per Creator
              </h3>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-10 bg-primary/10 animate-pulse rounded w-32"></div>
                <div className="h-4 bg-primary/10 animate-pulse rounded w-48"></div>
              </div>
            ) : (
              <>
                <p className="text-4xl font-bold text-green-500 mb-2">${otherStatsData[1]?.value}</p>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
                <div className="mt-4 pt-4 border-t border-border/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Revenue Combined of all Creators</span>
                    <span className="font-semibold text-foreground">${otherStatsData[0]?.value}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Signups (Last 7 Days) */}
        <div className="lg:col-span-2 bg-card  border border-border/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-6 border-b border-border/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10  flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  Recent Signups (Last 7 Days)
                </h3>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground">{recentSignupsCount} new users</span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border/20">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 animate-pulse rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-primary/10 animate-pulse rounded mb-2 w-32"></div>
                    <div className="h-3 bg-primary/10 animate-pulse rounded w-48"></div>
                  </div>
                  <div className="h-6 w-16 bg-primary/10 animate-pulse rounded"></div>
                </div>
              ))
            ) : (
              recentSignupsData.map((user) => (
                <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors">
                  <UserAvatar
                    src={user.avatar}
                    name={user.name}
                    className="w-10 h-10"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{user.name}</p>
                      <span className="text-xs text-muted-foreground truncate">@{user.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{user.email || 'No email'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-xs text-xs font-medium capitalize ${user.role === 'CREATOR'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-orange-500/10 text-orange-500'
                        } `}>
                        {(user.role || 'Member').toLowerCase()}
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span className="mt-1">{formatRelativeTime(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Creator Profile Dialog */}
      <UserInfoDialog
        creator={selectedCreator}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />

    </div>
  );
}
