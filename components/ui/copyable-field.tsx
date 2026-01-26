"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CopyableFieldProps {
    label: React.ReactNode;
    value: string;
    className?: string;
    toastMessage?: string;
}

export function CopyableField({
    label,
    value,
    className,
    toastMessage = "Copied to clipboard!"
}: CopyableFieldProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        toast.success(toastMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("bg-muted/30 border border-border p-3 relative", className)}>
            <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1 min-w-0 overflow-hidden">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                        {label}
                    </div>
                    <p className="text-xs text-foreground break-all pr-8">
                        {value}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <Check className="w-3 h-3 text-green-500" />
                    ) : (
                        <Copy className="w-3 h-3 dark:text-white" />
                    )}
                </Button>
            </div>
        </div>
    );
}
