"use client";

import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
    User,
    Moon, 
    Sun,
    LogOut,
    ChevronDown
} from "lucide-react";
import { Session } from "next-auth";
import { Switch } from "@/components/ui";
import { getTheme, setTheme, initTheme } from "@/lib/theme";

interface MenuItem {
    label: string;
    href: string;
    icon?: any;
}

interface UserMenuProps {
    session: Session | null;
    roleLabel: string;
    menuItems: MenuItem[];
    signOutCallbackUrl?: string;
}

export default function UserMenu({ session, roleLabel, menuItems, signOutCallbackUrl = "/login" }: UserMenuProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const profileWrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        initTheme();
        setIsDarkMode(getTheme() === "dark");
    }, []);

    // Close profile menu when clicking outside or pressing Escape
    useEffect(() => {
        if (!showProfileMenu) return;

        const onDocClick = (e: MouseEvent) => {
            if (!profileWrapperRef.current) return;

            // Check if the click is on a dialog element
            const target = e.target as Element;
            const isDialogElement = target.closest('[data-radix-portal]') ||
                target.closest('[role="dialog"]') ||
                target.closest('[data-state]');

            // Don't close if clicking on dialog elements
            if (isDialogElement) return;

            if (!profileWrapperRef.current.contains(e.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowProfileMenu(false);
        };

        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [showProfileMenu]);

    const toggleThemeHandler = () => {
        const newTheme = isDarkMode ? "light" : "dark";
        setTheme(newTheme);
        setIsDarkMode(newTheme === "dark");
    };

    return (
        <div className="relative" ref={profileWrapperRef}>
            <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors"
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
            >
                <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    <User className="w-5 h-5" />
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-card/95 backdrop-blur-md border border-border/30 shadow-sm z-50 rounded-lg">
                    <div className="p-3 border-b border-border/50">
                        <p className="text-sm font-medium text-foreground">
                            {session?.user?.name || session?.user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{roleLabel}</p>
                    </div>
                    <div className="p-2">
                        {menuItems && menuItems.length > 0 && menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent/50 transition-colors rounded-md"
                                onClick={() => setShowProfileMenu(false)}
                            >
                                {item.icon ? <item.icon className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                <p>{item.label}</p>
                            </Link>
                        ))}

                        <div className="flex items-center justify-between px-3 py-2 text-sm">
                            <div className="flex items-center gap-3 text-foreground">
                                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                <p>Dark Mode</p>
                            </div>
                            <Switch
                                checked={isDarkMode}
                                onCheckedChange={toggleThemeHandler}
                                className="data-[state=checked]:bg-foreground"
                            />
                        </div>
                        <button
                            onClick={async () => {
                                setShowProfileMenu(false);
                                await signOut({ callbackUrl: signOutCallbackUrl, redirect: true });
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-accent/50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <p>Sign Out</p>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
