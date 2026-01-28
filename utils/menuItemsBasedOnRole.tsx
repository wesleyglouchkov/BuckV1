
import {
    LayoutDashboard,
    User,
    Users
} from "lucide-react";

export const getMenuItemsBasedOnRole = (role?: string) => {
    const normalizedRole = role?.toLowerCase();

    if (normalizedRole === "admin") {
        return [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }];
    }

    if (normalizedRole === "creator") {
        return [
            { label: "Dashboard", href: "/creator/dashboard", icon: LayoutDashboard },
            { label: "My Creators", href: "/my-creators", icon: Users }
        ];
    }

    if (normalizedRole === "member") {
        return [
            { label: "View Profile", href: "/profile", icon: User },
            { label: "My Creators", href: "/my-creators", icon: Users }
        ];
    }

    return [];
};
