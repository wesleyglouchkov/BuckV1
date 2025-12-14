"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserMenu from "@/components/UserMenu";

interface OpenExploreNavbarProps {
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
    session: any;
    status: string;
    roleLabel: string;
    menuItems: any[];
}

export default function OpenExploreNavbar({
    mobileMenuOpen,
    setMobileMenuOpen,
    searchQuery,
    setSearchQuery,
    session,
    status,
    roleLabel,
    menuItems,
}: OpenExploreNavbarProps) {
    const router = useRouter();

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
            { setSearchQuery && searchQuery &&   <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search creator, live class..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-input border-border focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                        />
                    </div>
                </div>}

                {/* Right Side - Auth Buttons or Profile */}
                <div className="flex items-center gap-3">
                    {status === "loading" ? (
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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
