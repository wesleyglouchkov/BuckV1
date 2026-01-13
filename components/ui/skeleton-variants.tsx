import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface SkeletonCardProps {
  className?: string;
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

interface SkeletonAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

interface SkeletonBoxProps {
  width?: string;
  height?: string;
  className?: string;
}

// Card skeleton for content cards
export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("border border-border/20 p-4 space-y-4 shadow-sm", className)}>
      <Skeleton className="h-40 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

// Text skeleton for paragraphs
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-4/5" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

// Avatar skeleton
export function SkeletonAvatar({ size = "md", className }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <Skeleton
      className={cn(sizeClasses[size], className)}
    />
  );
}

// Generic box skeleton
export function SkeletonBox({ width, height, className }: SkeletonBoxProps) {
  return (
    <Skeleton
      className={className}
      style={{ width, height }}
    />
  );
}

// List item skeleton
export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-4", className)}>
      <Skeleton className="h-12 w-12" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 4, className }: { columns?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-4 border-b border-border/20", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === 0 ? "w-1/4" : "flex-1"
          )}
        />
      ))}
    </div>
  );
}

// Stats card skeleton
export function SkeletonStats({ className }: { className?: string }) {
  return (
    <div className={cn("border border-border/20 p-6 space-y-3 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// Dashboard grid skeleton
export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStats key={i} />
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="border border-border p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

// Live stream page skeleton
export function SkeletonLiveStream({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Video preview skeleton */}
      <Skeleton className="aspect-video w-full" />
      {/* Stream setup card skeleton */}
      <div className="border border-border/20 p-4 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

// Sidebar item skeleton
export function SkeletonSidebarItem({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 py-2", collapsed ? "justify-center" : "px-2.5")}>
      <Skeleton className="h-8 w-8 shrink-0" />
      {!collapsed && (
        <div className="flex-1 space-y-1 overflow-hidden">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      )}
    </div>
  );
}
