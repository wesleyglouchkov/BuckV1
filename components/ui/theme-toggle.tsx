"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { getTheme, setTheme } from "@/lib/theme";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsDark(getTheme() === "dark");
    }, []);

    const handleToggle = (checked: boolean) => {
        const theme = checked ? "dark" : "light";
        setIsDark(checked);
        setTheme(theme);
    };

    if (!mounted) {
        return <div className="h-6 w-11 bg-muted/20" />;
    }

    return (
        <div className="flex items-center">
            <Switch
                id="theme-toggle"
                checked={isDark}
                onCheckedChange={handleToggle}
                aria-label="Toggle theme"
            />
        </div>
    );
}
