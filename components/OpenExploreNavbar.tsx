"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserMenu from "@/components/UserMenu";
import SearchPopup from "@/components/explore/SearchPopup";

interface OpenExploreNavbarProps {
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
    session: any;
    status: string;
    roleLabel: string;
    menuItems: any[];
    showSearchPopup?: boolean;
    hideSearchBar?: boolean;
}

export default function OpenExploreNavbar({
    mobileMenuOpen,
    setMobileMenuOpen,
    searchQuery = "",
    setSearchQuery,
    session,
    status,
    roleLabel,
    menuItems,
    showSearchPopup = true,
    hideSearchBar = false,
}: OpenExploreNavbarProps) {
    const router = useRouter();
    const [localQuery, setLocalQuery] = useState(searchQuery);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync local query with prop
    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    // Debounce search query
    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => {
            setDebouncedQuery(localQuery);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [localQuery]);

    // Handle input change
    const handleInputChange = useCallback((value: string) => {
        setLocalQuery(value);
        if (setSearchQuery) {
            setSearchQuery(value);
        }
    }, [setSearchQuery]);

    // Handle search submit
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (localQuery.trim()) {
            router.push(`/explore?search=${encodeURIComponent(localQuery.trim())}`);
            setIsSearchFocused(false);
            inputRef.current?.blur();
        }
    };

    // Close popup on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close popup on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsSearchFocused(false);
                inputRef.current?.blur();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    const clearSearch = () => {
        setLocalQuery("");
        if (setSearchQuery) {
            setSearchQuery("");
        }
        inputRef.current?.focus();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border/50 px-3 z-30">
            <div className="h-full flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 hover:bg-accent transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="w-5 h-5 text-foreground" />
                    </button>

                    <Link href="/explore" className="flex items-center">
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
                    >
                        Browse
                    </Link>
                </div>

                {/* Center Search Bar */}
                {!hideSearchBar && (
                    <div className="hidden md:flex flex-1 max-w-2xl mx-8" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                ref={inputRef}
                                type="text"
                                placeholder="Search creator, live class..."
                                value={localQuery}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                className="w-full pl-10 pr-10 py-2 bg-input border-border focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                            />
                            {localQuery && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {isSearching ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <X className="w-4 h-4" />
                                    )}
                                </button>
                            )}

                            {/* Search Popup */}
                            {showSearchPopup && (
                                <SearchPopup
                                    query={debouncedQuery}
                                    isVisible={isSearchFocused && debouncedQuery.length >= 2}
                                    onClose={() => setIsSearchFocused(false)}
                                />
                            )}
                        </form>
                    </div>
                )}

                {/* Right Side - Auth Buttons or Profile */}
                <div className="flex items-center gap-3">
                    {status === "loading" ? (
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin" />
                    ) : session ? (
                        <UserMenu
                            session={session}
                            roleLabel={roleLabel}
                            menuItems={menuItems}
                            signOutCallbackUrl="/explore"
                        />
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => router.push("/login")}>
                                Log In
                            </Button>
                            <Button onClick={() => router.push("/signup")}>
                                Sign Up
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
