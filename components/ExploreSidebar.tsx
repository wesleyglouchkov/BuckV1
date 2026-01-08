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

// Mock live channels data
const liveChannels = [
    { id: 1, name: "Fortnite Live", creator: "ProGamer", viewers: "2.5K", category: "Games" },
    { id: 2, name: "Guitar Masterclass", creator: "MusicPro", viewers: "1.2K", category: "Music & DJs" },
    { id: 3, name: "Digital Art Tutorial", creator: "ArtMaster", viewers: "890", category: "Creative" },
    { id: 4, name: "Just Chatting", creator: "CasualStreamer", viewers: "650", category: "IRL" },
    { id: 5, name: "Cooking Show", creator: "ChefLife", viewers: "420", category: "IRL" },
];

interface ExploreSidebarProps {
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    categoriesExpanded: boolean;
    setCategoriesExpanded: (expanded: boolean) => void;
    showAllCategories: boolean;
    setShowAllCategories: (show: boolean) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

export default function ExploreSidebar({
    sidebarCollapsed,
    setSidebarCollapsed,
    categoriesExpanded,
    setCategoriesExpanded,
    showAllCategories,
    setShowAllCategories,
    mobileMenuOpen,
    setMobileMenuOpen,
}: ExploreSidebarProps) {
    const displayedCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 4);

    return (
        <>
            {/* Desktop Sidebar */}
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

                {/* Live Channels Section */}
                <div className="px-2 py-3 border-b border-border/20">
                    <div className={`flex items-center gap-2 px-2.5 py-2 mb-2 ${sidebarCollapsed ? "justify-center" : ""}`}>
                        <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                        {!sidebarCollapsed && (
                            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Live Channels
                            </h3>
                        )}
                    </div>
                    <ul className="space-y-1">
                        {liveChannels.map((channel) => (
                            <li key={channel.id}>
                                <Link
                                    href={`/explore/live/${channel.id}`}
                                    className={`flex items-center gap-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors ${sidebarCollapsed ? "justify-center px-0 rounded-md" : "px-2.5"
                                        }`}
                                >
                                    <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        <Image
                                            src="https://static-cdn.jtvnw.net/jtv_user_pictures/a8c959b1-750e-47d2-9cae-d8c2b1327d82-profile_image-70x70.png"
                                            alt={channel.creator}
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    </div>
                                    {!sidebarCollapsed && (
                                        <div className="flex-1 flex items-center justify-between gap-1.5 overflow-hidden min min-w-0">
                                            <div>
                                                <p className="text-sm font-medium text-foreground truncate">{channel.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{channel.creator}  </p>
                                            </div>

                                            <div className="flex justify-center items-center font-bold gap-1">
                                                <p className="text-red-500 text-4xl pt-2">•</p>
                                                <p className="text-sm">{channel.viewers}</p>
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Categories Section */}
                {!sidebarCollapsed && (
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
                                                    href={`/explore?category=${category.name.toLowerCase()}`}
                                                    className="flex items-center gap-3 px-2.5 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                                >
                                                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                                                        <IconComponent className="text-primary" size={18} />
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
                )}
            </aside>

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
                        {/* Live Channels Section */}
                        <div className="px-2 py-3 border-b border-border/20">
                            <div className="flex items-center gap-2 px-2.5 py-2 mb-2">
                                <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                    Live Channels
                                </h3>
                            </div>
                            <ul className="space-y-1">
                                {liveChannels.map((channel) => (
                                    <li key={channel.id}>
                                        <Link
                                            href={`/explore/live/${channel.id}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-2 px-2.5 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                {channel.creator.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{channel.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{channel.creator} • {channel.viewers}</p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Categories Section */}
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
                                                        href={`/explore?category=${category.name.toLowerCase()}`}
                                                        onClick={() => setMobileMenuOpen(false)}
                                                        className="flex items-center gap-3 px-2.5 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                                    >
                                                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                                                            <IconComponent className="text-primary" size={18} />
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
                    </div>
                </div>
            )}
        </>
    );
}
