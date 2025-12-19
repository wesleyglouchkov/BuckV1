"use client";
import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard, SkeletonBox } from "@/components/ui/skeleton-variants";

import {
  Search,
  LayoutDashboard,
  Radio,
  ChevronDown,
  ChevronRight,
  ArrowLeftToLine,
  ArrowRightFromLine,
  User,
  Users
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";


// Mock creators data
const creators = [
  { id: 1, name: "ProGamer", username: "progamer", category: "Games", followers: "125K", avatar: "🎮", online: true },
  { id: 2, name: "MusicPro", username: "musicpro", category: "Music & DJs", followers: "98K", avatar: "🎧", online: true },
  { id: 3, name: "ArtMaster", username: "artmaster", category: "Creative", followers: "76K", avatar: "🎨", online: false },
  { id: 4, name: "FitCoach", username: "fitcoach", category: "Fitness", followers: "54K", avatar: "💪", online: true },
  { id: 5, name: "TechGuru", username: "techguru", category: "Technology", followers: "103K", avatar: "💻", online: false },
  { id: 6, name: "ChefMaster", username: "chefmaster", category: "Cooking", followers: "67K", avatar: "🍳", online: true },
];

// Mock live channels data
const liveChannels = [
  { id: 1, name: "Fortnite Live", creator: "ProGamer", viewers: "2.5K", category: "Games" },
  { id: 2, name: "Guitar Masterclass", creator: "MusicPro", viewers: "1.2K", category: "Music & DJs" },
  { id: 3, name: "Digital Art Tutorial", creator: "ArtMaster", viewers: "890", category: "Creative" },
  { id: 4, name: "Just Chatting", creator: "CasualStreamer", viewers: "650", category: "IRL" },
  { id: 5, name: "Cooking Show", creator: "ChefLife", viewers: "420", category: "IRL" },
];

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isLoadingCreators, setIsLoadingCreators] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const selectedCategory = searchParams.get("category");

  // Set page title
  useEffect(() => {
    document.title = "Explore | Buck";
  }, []);

  const filteredCreators = selectedCategory
    ? creators.filter(c => c.category.toLowerCase() === selectedCategory.toLowerCase())
    : creators;

  const displayedCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 4);

  const getMenuItems = () => {
    const role = session?.user?.role?.toLowerCase();

    if (role === "admin") {
      return [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }];
    }
    if (role === "creator") {
      return [{ label: "Dashboard", href: "/creator/dashboard", icon: LayoutDashboard }];
    }
    if (role === "member") {
      return [
        { label: "View Profile", href: "/profile", icon: User },
        { label: "My Creators", href: "/my-creators", icon: Users }
      ];
    }
    return [];
  };

  const getRoleLabel = () => {
    const role = session?.user?.role.toLowerCase();
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <OpenExploreNavbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        session={session}
        status={status}
        roleLabel={getRoleLabel()}
        menuItems={getMenuItems()}
      />


      {/* Mobile Search */}
      <div className="md:hidden fixed top-16 left-0 right-0 bg-card border-b border-border/20 p-4 z-20">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search creator, class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border-border focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          />
        </div>
      </div>

      {/* Sidebar */}
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
      {
        mobileMenuOpen && (
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
        )
      }

      {/* Main Content */}
      <main className={`pt-16 pb-8 transition-all duration-300 ease-out ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}>
        <div className="md:hidden h-16"></div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Categories Section */}
          <section className="mt-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Browse Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {isLoadingCategories ? (
                // Skeleton loading state
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="relative bg-card border border-border/40 rounded-2xl overflow-hidden h-36 p-5">
                      <div className="space-y-2">
                        <SkeletonBox width="60%" height="20px" />
                        <SkeletonBox width="40%" height="16px" />
                      </div>
                      <div className="absolute -bottom-6 -right-6">
                        <SkeletonBox width="140px" height="140px" className="rounded-full" />
                      </div>
                      <div className="absolute top-4 right-4">
                        <SkeletonBox width="24px" height="24px" className="rounded-full" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                // Actual category cards
                CATEGORIES.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Link
                      key={category.id}
                      href={`/explore?category=${category.name.toLowerCase()}`}
                      className="group"
                    >
                      <div className="relative bg-linear-to-br from-card to-card/50 border border-border/40 rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-1 h-36">
                        {/* Background gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </div>

                        {/* Content */}
                        <div className="relative h-full flex flex-col justify-between p-5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-foreground font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-300">{category.name}</h3>
                              <p className="text-muted-foreground text-sm font-medium">{(category.count ?? 0).toLocaleString()} classes</p>
                            </div>
                          </div>

                          {/* Large floating icon */}
                          <div className="absolute -bottom-6 -right-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <div className="relative">
                              {/* Glow effect */}
                              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <IconComponent className="text-primary/40 group-hover:text-primary/50 transition-colors duration-500 relative z-10" size={140} />
                            </div>
                          </div>

                          {/* Small accent icon top right */}
                          <div className="absolute top-4 right-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                            <IconComponent className="text-primary/60" size={24} />
                          </div>
                        </div>                      {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-primary/0 via-primary to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>

          {/* Creators Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedCategory ? `${selectedCategory} Creators` : "Featured Creators"}
              </h2>
              {selectedCategory && (
                <Button variant="outline" size="sm" onClick={() => router.push("/explore")}>
                  Clear Filter
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingCreators ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} className="h-[200px]" />
                  ))}
                </>
              ) : (
                // Actual creator cards
                filteredCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="bg-card rounded-lg border border-border/30 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center text-3xl">
                          {creator.avatar}
                        </div>
                        {creator.online && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-card rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{creator.name}</h3>
                        <p className="text-sm text-muted-foreground">@{creator.username}</p>
                        <p className="text-xs text-muted-foreground mt-1">{creator.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{creator.followers} followers</p>
                      <Button size="sm" variant={creator.online ? "default" : "outline"}>
                        {creator.online ? "Watch Live" : "Follow"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div >
  );
}

