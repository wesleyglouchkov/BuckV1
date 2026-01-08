"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import SearchAllTab from "@/components/explore/SearchAllTab";
import SearchStreamsTab from "@/components/explore/SearchStreamsTab";
import SearchCreatorsTab from "@/components/explore/SearchCreatorsTab";

type TabType = "all" | "streams" | "creators";

interface SearchResultsProps {
    initialSearch?: string;
    initialTab?: string;
}

export default function SearchResults({ initialSearch = "", initialTab = "all" }: SearchResultsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [activeTab, setActiveTab] = useState<TabType>(
        (initialTab === "creators" || initialTab === "streams") ? initialTab : "all"
    );
    const [streamCategory, setStreamCategory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Sync with URL params
    useEffect(() => {
        const search = searchParams.get("search") || "";
        const tab = searchParams.get("tab") || "all";
        const category = searchParams.get("category");

        setSearchQuery(search);
        setActiveTab((tab === "creators" || tab === "streams") ? tab : "all");
        setStreamCategory(category);
    }, [searchParams]);

    // Update URL when search/tab changes
    const updateUrl = (newSearch: string, newTab: string, newCategory?: string | null) => {
        const params = new URLSearchParams();
        if (newSearch) params.set("search", newSearch);
        // Always set tab param when in search results view to prevent exiting
        if (newTab && newTab !== "all") {
            params.set("tab", newTab);
        } else if (!newSearch && newTab === "all") {
            // If no search and going to "all", set tab to keep in search view
            params.set("tab", "all");
        }
        if (newCategory) params.set("category", newCategory);

        router.push(`/explore?${params.toString()}`, { scroll: false });
    };

    const handleTabChange = (tab: string) => {
        const newTab = tab as TabType;
        setActiveTab(newTab);
        updateUrl(searchQuery, newTab, newTab === "streams" ? streamCategory : null);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        // Clear previous timeout
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Debounce URL update
        debounceTimerRef.current = setTimeout(() => {
            updateUrl(value, activeTab, activeTab === "streams" ? streamCategory : null);
        }, 300);
    };

    const handleCategoryChange = (category: string | null) => {
        setStreamCategory(category);
        updateUrl(searchQuery, activeTab, category);
    };

    const clearSearch = () => {
        setSearchQuery("");
        router.push("/explore", { scroll: false });
    };

    const tabs = [
        { id: "all", label: "All Results" },
        { id: "streams", label: "Classes" },
        { id: "creators", label: "Creators" },
    ];

    return (
        <div>
            {/* Search Header */}
            <div className="mb-8">
                <div className="relative max-w-2xl">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search creators, classes, categories..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 text-lg bg-card border-border focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="mt-3 text-muted-foreground">
                        Showing results for <span className="font-medium text-foreground">"{searchQuery}"</span>
                    </p>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-border mb-6">
                <div className="flex gap-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === tab.id
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "all" && (
                    <SearchAllTab
                        searchQuery={searchQuery}
                        onTabChange={handleTabChange}
                        isLoading={isLoading}
                    />
                )}
                {activeTab === "streams" && (
                    <SearchStreamsTab
                        searchQuery={searchQuery}
                        selectedCategory={streamCategory}
                        onCategoryChange={handleCategoryChange}
                        isLoading={isLoading}
                    />
                )}
                {activeTab === "creators" && (
                    <SearchCreatorsTab
                        searchQuery={searchQuery}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    );
}
