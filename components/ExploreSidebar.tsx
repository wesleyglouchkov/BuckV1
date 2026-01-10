"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Radio,
    ChevronDown,
    ChevronRight,
    ArrowLeftToLine,
    ArrowRightFromLine,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants/categories";

import { useExploreData, SidebarCategory, SidebarStream } from "@/hooks/explore";
import { SkeletonSidebarItem } from "@/components/ui/skeleton-variants";

const formatViewerCount = (count: number) => {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
};

interface ExploreSidebarProps {
    sidebarCollapsed?: boolean;
    setSidebarCollapsed?: (collapsed: boolean) => void;
    categoriesExpanded?: boolean;
    setCategoriesExpanded?: (expanded: boolean) => void;
    showAllCategories?: boolean;
    setShowAllCategories?: (show: boolean) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    desktopHidden?: boolean;
}

export default function ExploreSidebar({
    sidebarCollapsed = false,
    setSidebarCollapsed = () => { },
    categoriesExpanded = true,
    setCategoriesExpanded = () => { },
    showAllCategories = false,
    setShowAllCategories = () => { },
    mobileMenuOpen,
    setMobileMenuOpen,
    desktopHidden = false,
}: ExploreSidebarProps) {
    const { streams, categories: apiCategories, isLoading } = useExploreData();

    // Enrich static categories with counts from API
    const enrichedCategories = CATEGORIES.map(cat => {
        const apiCat = apiCategories.find((ac: SidebarCategory) => ac.name.toLowerCase() === cat.name.toLowerCase());
        return {
            ...cat,
            count: apiCat ? apiCat.count : 0
        };
    });

    const displayedCategories = showAllCategories ? enrichedCategories : enrichedCategories.slice(0, 4);

    const LiveChannelsSection = ({ isMobile = false }) => (
        <div className={cn("px-2 py-3 border-b border-border/20", !isMobile && sidebarCollapsed && "px-0")}>
            <div className={cn("flex items-center gap-2 px-2.5 py-2 mb-2", !isMobile && sidebarCollapsed && "justify-center px-0")}>
                <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                {(!sidebarCollapsed || isMobile) && (
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Live Channels
                    </h3>
                )}
            </div>
            <ul className="space-y-1">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <li key={i}>
                            <SkeletonSidebarItem collapsed={!isMobile && sidebarCollapsed} />
                        </li>
                    ))
                ) : (
                    streams.map((channel: SidebarStream) => (
                        <li key={channel.id}>
                            <Link
                                href={`/live/${channel.id}`}
                                onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
                                className={cn(
                                    "flex items-center gap-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                                    !isMobile && sidebarCollapsed ? "justify-center px-0 rounded-md" : "px-2.5"
                                )}
                            >
                                <div className="w-8 h-8 shrink-0">
                                    {channel.creator.avatar ? (
                                        <Image
                                            src={channel.creator.avatar}
                                            alt={channel.creator.name}
                                            width={32}
                                            height={32}
                                            className="rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                            {channel.creator.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {(!sidebarCollapsed || isMobile) && (
                                    <div className="flex-1 flex items-center justify-between gap-1.5 overflow-hidden min-w-0">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground truncate">{channel.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{channel.creator.name}</p>
                                        </div>

                                        <div className="flex items-center font-medium gap-1 shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            <p className="text-xs">{formatViewerCount(channel.viewerCount)}</p>
                                        </div>
                                    </div>
                                )}
                            </Link>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );

    const CategoriesSection = ({ isMobile = false }) => {
        if (!isMobile && sidebarCollapsed) return null;

        return (
            <div className="px-2 py-3">
                <button
                    onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                    className="flex items-center justify-between w-full px-2.5 py-2 mb-2 hover:bg-accent transition-colors"
                >
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Class Categories
                    </h3>
                    {categoriesExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>

                {categoriesExpanded && (
                    <>
                        <ul className="space-y-1">
                            {displayedCategories.map((category) => {
                                const IconComponent = category.icon;
                                return (
                                    <li key={category.id}>
                                        <Link
                                            href={`/explore?tab=streams&category=${encodeURIComponent(category.name)}`}
                                            onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
                                            className="flex items-center gap-3 px-2.5 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center relative">
                                                <IconComponent className="text-primary" size={18} />
                                                {category.count > 0 && (
                                                    <div className="absolute -top-1 pt-[2px] -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full">
                                                        {category.count}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium">{category.name}</p>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        <button
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className="w-full mt-2 px-2.5 py-2 text-sm font-medium text-primary hover:bg-accent transition-colors text-left"
                        >
                            {showAllCategories ? "Show Less" : "See More"}
                        </button>
                    </>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Desktop Sidebar */}
            {!desktopHidden && (
                <aside
                    className={`hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border/20 bg-card overflow-y-auto shrink-0 transition-[width] duration-300 ease-out z-20 shadow-sm ${sidebarCollapsed ? "w-16" : "w-64"
                        }`}
                >
                    <div className="flex items-center justify-between px-4 py-4 border-b border-border/20">
                        <div className={`overflow-hidden ${sidebarCollapsed ? "w-0" : "w-40"}`}>
                            <p
                                className={`text-xl font-bold text-foreground whitespace-nowrap transition-opacity duration-200 ${sidebarCollapsed ? "opacity-0" : "opacity-100"
                                    }`}
                            >
                                Browse
                            </p>
                        </div>
                        <button
                            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="ml-auto cursor-pointer flex h-8 w-8 items-center justify-center hover:bg-accent transition-colors"
                        >
                            {sidebarCollapsed ? (
                                <ArrowRightFromLine className="h-5 w-5 text-muted-foreground cursor-pointer" />
                            ) : (
                                <ArrowLeftToLine className="h-5 w-5 text-muted-foreground cursor-pointer" />
                            )}
                        </button>
                    </div>

                    <LiveChannelsSection />
                    <CategoriesSection />
                </aside>
            )}

            {/* Mobile Sidebar Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border/20 shadow-sm transform transition-transform duration-300 ease-out animate-in slide-in-from-left overflow-y-auto">
                        <div className="flex items-center gap-3 px-4 h-16 border-b border-border/20">
                            <Link href="/explore" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                                <Image
                                    src="/buck.svg"
                                    alt="Buck Logo"
                                    width={40}
                                    height={12}
                                    className="dark:hidden"
                                    priority
                                />
                                <Image
                                    src="/buck-dark.svg"
                                    alt="Buck Logo"
                                    width={40}
                                    height={12}
                                    className="hidden dark:block"
                                    priority
                                />
                            </Link>
                            <Link
                                href="/explore"
                                className="text-base font-medium text-primary hover:text-primary/80 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Browse
                            </Link>
                        </div>

                        <LiveChannelsSection isMobile={true} />
                        <CategoriesSection isMobile={true} />
                    </div>
                </div>
            )}
        </>
    );
}

import { cn } from "@/lib/utils";

