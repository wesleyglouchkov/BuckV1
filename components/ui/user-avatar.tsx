import { User } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getSignedStreamUrl } from "@/app/actions/s3-actions";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string | null;
    name: string;
    size?: "sm" | "md" | "lg" | "xl";
    rounded?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
};

export function UserAvatar({
    src,
    name,
    size = "md",
    rounded = false,
    className = ""
}: UserAvatarProps) {
    const [signedSrc, setSignedSrc] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setHasError(false);

        const fetchSignedUrl = async () => {
            if (!src) {
                setSignedSrc(null);
                return;
            }

            try {
                const url = await getSignedStreamUrl(src);
                if (isMounted) {
                    setSignedSrc(url);
                }
            } catch (error) {
                console.error("Failed to sign avatar URL:", error);
                if (isMounted) setSignedSrc(null);
            }
        };

        fetchSignedUrl();

        return () => {
            isMounted = false;
        };
    }, [src]);

    const sizeClass = sizeClasses[size];
    const roundedClass = rounded ? "rounded-full" : "";

    const initials = name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : "?";

    if (signedSrc && !hasError) {
        return (
            <div className={cn(sizeClass, "relative overflow-hidden border border-border/50 shrink-0", roundedClass, className)}>
                <Image
                    src={signedSrc}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100px, 200px"
                    onError={() => setHasError(true)}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                sizeClass,
                "bg-linear-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 flex items-center justify-center text-primary font-bold shadow-inner shrink-0 border border-primary/20",
                roundedClass,
                className
            )}
        >
            <span className="antialiased">
                {name ? initials : <User className="w-1/2 h-1/2" />}
            </span>
        </div>
    );
}
