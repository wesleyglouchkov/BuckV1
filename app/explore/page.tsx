"use client";
import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import ExploreSidebar from "@/components/ExploreSidebar";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard, SkeletonBox } from "@/components/ui/skeleton-variants";

import {
  Search,
  LayoutDashboard,
  User,
  Users
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants/categories";


// Mock creators data
const creators = [
  { id: 1, name: "ProGamer", username: "progamer", category: "Games", followers: "125K", avatar: "🎮", online: true },
  { id: 2, name: "MusicPro", username: "musicpro", category: "Music & DJs", followers: "98K", avatar: "🎧", online: true },
  { id: 3, name: "ArtMaster", username: "artmaster", category: "Creative", followers: "76K", avatar: "🎨", online: false },
  { id: 4, name: "FitCoach", username: "fitcoach", category: "Fitness", followers: "54K", avatar: "💪", online: true },
  { id: 5, name: "TechGuru", username: "techguru", category: "Technology", followers: "103K", avatar: "💻", online: false },
  { id: 6, name: "ChefMaster", username: "chefmaster", category: "Cooking", followers: "67K", avatar: "🍳", online: true },
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

      <ExploreSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        categoriesExpanded={categoriesExpanded}
        setCategoriesExpanded={setCategoriesExpanded}
        showAllCategories={showAllCategories}
        setShowAllCategories={setShowAllCategories}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

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

