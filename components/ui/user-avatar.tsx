import { User } from "lucide-react";
import Image from "next/image";

interface UserAvatarProps {
    src?: string | null;
    name: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
};

export function UserAvatar({ src, name, size = "md", className = "" }: UserAvatarProps) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    const sizeClass = sizeClasses[size];

    if (src) {
        return (
            <div className={`${sizeClass} relative rounded-full overflow-hidden ${className}`}>
                <Image
                    src={src}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100px, 200px"
                />
            </div>
        );
    }

    return (
        <div
            className={`${sizeClass} bg-linear-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm ${className}`}
        >
             <User/>
        </div>
    );
}
