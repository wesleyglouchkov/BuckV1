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
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);
    const [activeTab, setActiveTab] = useState<TabType>(
        (initialTab === "creators" || initialTab === "streams") ? initialTab : "all"
    );
    const [streamCategory, setStreamCategory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLiveFilter, setIsLiveFilter] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Sync with URL params
    useEffect(() => {
        const search = searchParams.get("search") || "";
        const tab = searchParams.get("tab") || "all";
        const category = searchParams.get("category");
        const page = parseInt(searchParams.get("page") || "1");
        const isLive = searchParams.get("isLive");

        setSearchQuery(search);
        setDebouncedSearchQuery(search);
        setActiveTab((tab === "creators" || tab === "streams") ? tab : "all");
        setStreamCategory(category);
        setCurrentPage(page);
        setIsLiveFilter(isLive === "true" ? true : isLive === "false" ? false : null);
    }, [searchParams]);

    // Update URL when search/tab/category/page/isLive changes
    const updateUrl = (params: {
        search?: string;
        tab?: string;
        category?: string | null;
        page?: number;
        isLive?: boolean | null;
    }) => {
        const newParams = new URLSearchParams(searchParams.toString());

        if (params.search !== undefined) {
            if (params.search) newParams.set("search", params.search);
            else newParams.delete("search");
        }

        if (params.tab !== undefined) {
            if (params.tab) newParams.set("tab", params.tab);
            else newParams.delete("tab");
        } else if (!newParams.has("tab")) {
            // Default to 'all' if no tab is present and we want to stay in search view
            newParams.set("tab", "all");
        }

        if (params.category !== undefined) {
            if (params.category) newParams.set("category", params.category);
            else newParams.delete("category");
        }

        if (params.page !== undefined) {
            if (params.page > 1) newParams.set("page", params.page.toString());
            else newParams.delete("page");
        }

        if (params.isLive !== undefined) {
            if (params.isLive !== null) newParams.set("isLive", params.isLive.toString());
            else newParams.delete("isLive");
        }

        router.push(`/explore?${newParams.toString()}`, { scroll: false });
    };

    const handleTabChange = (tab: string) => {
        const newTab = tab as TabType;
        setActiveTab(newTab);
        updateUrl({ tab: newTab, page: 1 }); // Reset page on tab change
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            setDebouncedSearchQuery(value);
            updateUrl({ search: value, page: 1 }); // Reset page on search change
        }, 300);
    };

    const handleCategoryChange = (category: string | null) => {
        setStreamCategory(category);
        updateUrl({ category, page: 1 }); // Reset page on category change
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateUrl({ page });
    };

    const handleIsLiveChange = (isLive: boolean | null) => {
        setIsLiveFilter(isLive);
        updateUrl({ isLive, page: 1 }); // Reset page on filter change
    };

    const clearSearch = () => {
        setSearchQuery("");
        updateUrl({ search: "", page: 1 });
    };

    const tabs = [
        { id: "all", label: "All Results" },
        { id: "streams", label: "Classes" },
        { id: "creators", label: "Creators" },
    ];

    const showSkeletons = isLoading || (searchQuery !== debouncedSearchQuery && searchQuery.length >= 1);

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
                        searchQuery={debouncedSearchQuery}
                        onTabChange={handleTabChange}
                        isLoading={showSkeletons}
                    />
                )}
                {activeTab === "streams" && (
                    <SearchStreamsTab
                        searchQuery={debouncedSearchQuery}
                        selectedCategory={streamCategory}
                        onCategoryChange={handleCategoryChange}
                        page={currentPage}
                        onPageChange={handlePageChange}
                        isLive={isLiveFilter}
                        onIsLiveChange={handleIsLiveChange}
                        isLoading={showSkeletons}
                    />
                )}
                {activeTab === "creators" && (
                    <SearchCreatorsTab
                        searchQuery={debouncedSearchQuery}
                        page={currentPage}
                        onPageChange={handlePageChange}
                        isLoading={showSkeletons}
                    />
                )}
            </div>
        </div>
    );
}
