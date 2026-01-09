"use client";

import OpenExploreNavbar from "@/components/OpenExploreNavbar";
import ExploreSidebar from "@/components/ExploreSidebar";
import SearchResults from "@/components/explore/SearchResults";
import { CategoryStreams } from "@/components/explore/CategoryStreams";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { SkeletonBox } from "@/components/ui/skeleton-variants";
import SearchPopup from "@/components/explore/SearchPopup";
import { useRef, useCallback } from "react";

import {
  Search,
  LayoutDashboard,
  User,
  Users
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants/categories";
import { useExploreData, SidebarCategory } from "@/hooks/explore";

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const { categories: apiCategories, isLoading: isLoadingCategories } = useExploreData();

  // Debounce search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      mobileInputRef.current?.blur();
    }
  };

  // Enrich static categories with counts from API
  const enrichedCategories = CATEGORIES.map(cat => {
    const apiCat = apiCategories.find((ac: SidebarCategory) => ac.name.toLowerCase() === cat.name.toLowerCase());
    return {
      ...cat,
      count: apiCat ? apiCat.count : 0
    };
  });

  // Get URL params
  const urlSearch = searchParams.get("search");
  const urlTab = searchParams.get("tab");

  // Determine if we should show search results view
  const showSearchResults = urlSearch || urlTab === "creators" || urlTab === "streams" || urlTab === "all";

  // Set page title
  useEffect(() => {
    if (showSearchResults) {
      document.title = urlSearch ? `Search: ${urlSearch} | Buck` : "Browse | Buck";
    } else {
      document.title = "Explore | Buck";
    }
  }, [showSearchResults, urlSearch]);

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
    const role = session?.user?.role?.toLowerCase();
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
        showSearchPopup={!showSearchResults}
        hideSearchBar={!!showSearchResults}
      />

      {/* Mobile Search */}
      <div className="md:hidden fixed top-16 left-0 right-0 bg-card border-b border-border/20 p-4 z-20" ref={mobileSearchRef}>
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            ref={mobileInputRef}
            type="text"
            placeholder="Search creator, class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full pl-10 pr-4 py-2 bg-input border-border focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          />
          {/* Mobile Search Popup */}
          <SearchPopup
            query={searchQuery}
            debouncedQuery={debouncedQuery}
            isVisible={isSearchFocused && searchQuery.length >= 1}
            onClose={() => setIsSearchFocused(false)}
          />
        </form>
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
        <div className="md:hidden h-16" />

        <div className="max-w-7xl mx-auto px-6">
          {showSearchResults ? (
            /* Search Results View */
            <section className="mt-8">
              <SearchResults
                initialSearch={urlSearch || ""}
                initialTab={urlTab || "all"}
              />
            </section>
          ) : (
            /* Default Browse View */
            <>
              {/* Categories Section */}
              <section className="mt-8 mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Browse Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                  {isLoadingCategories ? (
                    <>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="relative bg-card border border-border/40 overflow-hidden h-36 p-5">
                          <div className="space-y-2">
                            <SkeletonBox width="60%" height="20px" />
                            <SkeletonBox width="40%" height="16px" />
                          </div>
                          <div className="absolute -bottom-6 -right-6">
                            <SkeletonBox width="140px" height="140px" />
                          </div>
                          <div className="absolute top-4 right-4">
                            <SkeletonBox width="24px" height="24px" />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    enrichedCategories.map((category) => {
                      const IconComponent = category.icon;
                      const handleCategoryClick = () => {
                        const sectionId = `category-${category.name.toLowerCase().replace(/\s+/g, '-')}`;
                        const element = document.getElementById(sectionId);
                        if (element) {
                          const navbarOffset = 100; // Account for fixed navbar + some padding
                          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                          window.scrollTo({
                            top: elementPosition - navbarOffset,
                            behavior: 'smooth'
                          });
                        }
                      };
                      return (
                        <div
                          key={category.id}
                          onClick={handleCategoryClick}
                          className="group cursor-pointer"
                        >
                          <div className="relative bg-linear-to-br from-card to-card/50 border border-border/40 overflow-hidden hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-1 h-36">
                            {/* Background gradient overlay */}
                            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Shine effect on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                              <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </div>

                            {/* Content */}
                            <div className="relative h-full flex flex-col justify-between p-5">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-foreground font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-300">{category.name}</h3>
                                  <p className="text-muted-foreground text-sm font-medium">
                                    {category.count.toLocaleString()} {category.count === 1 ? 'class' : 'classes'}
                                  </p>
                                </div>
                              </div>

                              {/* Large floating icon */}
                              <div className="absolute -bottom-6 -right-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <div className="relative">
                                  {/* Glow effect */}
                                  <div className="absolute inset-0 bg-primary/20 blur-2xl scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  <IconComponent className="text-primary/40 group-hover:text-primary/50 transition-colors duration-500 relative z-10" size={140} />
                                </div>
                              </div>

                              {/* Small accent icon top right */}
                              <div className="absolute top-4 right-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                                <IconComponent className="text-primary/60" size={24} />
                              </div>
                            </div>
                            {/* Bottom accent line */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-primary/0 via-primary to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Category Streams Section */}
              <section className="mb-12">
                <CategoryStreams
                  isLoading={isLoadingCategories}
                  categories={apiCategories}
                />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
