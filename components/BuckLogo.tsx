"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BuckLogoProps {
    showBrowse?: boolean;
    className?: string;
    onClick?: () => void;
    width?: number;
    height?: number;
}

export default function BuckLogo({
    showBrowse = false,
    className,
    onClick,
    width = 30,
    height = 9
}: BuckLogoProps) {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <Link href="/explore" className="flex items-center" onClick={onClick}>
                <Image
                    src="/buck.svg"
                    alt="Buck Logo"
                    width={width}
                    height={height}
                    className="dark:hidden"
                    priority
                />
                <Image
                    src="/buck-dark.svg"
                    alt="Buck Logo"
                    width={width}
                    height={height}
                    className="hidden dark:block"
                    priority
                />
            </Link>
            {showBrowse && (
                <Link
                    href="/explore"
                    className="text-base font-medium text-primary hover:text-primary/80 transition-colors"
                    onClick={onClick}
                >
                    Browse
                </Link>
            )}
        </div>
    );
}
