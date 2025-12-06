"use client";

import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ResponsiveContainer,
  LineChart,
  Line as ReLine,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function CreatorDashboard() {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const chartData = useMemo(
    () => [
      { name: "Mon", value: 8 },
      { name: "Tue", value: 15 },
      { name: "Wed", value: 12 },
      { name: "Thu", value: 18 },
      { name: "Fri", value: 22 },
      { name: "Sat", value: 28 },
      { name: "Sun", value: 25 },
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
        {/* Chart - Full Width */}
        <div className="bg-card rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border/20">
            <p className="text-lg font-semibold text-card-foreground">Content Performance</p>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="h-[300px] w-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="creatorGradient" x1="0" y1="0" x2="0" y2="1">
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
                <ReLine 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 5, stroke: "#10B981", strokeWidth: 2, fill: isDarkMode ? "#1F2937" : "#ffffff" }}
                  fill="url(#creatorGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Cards - 3 in one row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border/20 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Total Views
            </h3>
            <p className="text-3xl font-bold text-primary">12.5K</p>
            <p className="text-sm text-muted-foreground mt-1">+18% from last month</p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border/20 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Published Content
            </h3>
            <p className="text-3xl font-bold text-primary">47</p>
            <p className="text-sm text-muted-foreground mt-1">+3 this week</p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border/20 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Engagement Rate
            </h3>
            <p className="text-3xl font-bold text-primary">8.2%</p>
            <p className="text-sm text-muted-foreground mt-1">+2.1% from last month</p>
          </div>
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
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground">Content Item {item}</p>
                  <p className="text-sm text-muted-foreground">Published 2 days ago</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">1.2K views</p>
                  <p className="text-xs text-muted-foreground">85% engagement</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
