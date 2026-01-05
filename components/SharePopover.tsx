"use client";

import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Facebook,
    Linkedin,
    Copy,
    Check,
    Share2,
} from "lucide-react";
import { toast } from "sonner";

interface SharePopoverProps {
    url: string;
    children?: React.ReactNode;
    align?: "center" | "start" | "end";
    side?: "top" | "right" | "bottom" | "left";
}

export function SharePopover({
    url,
    children,
    align = "center",
    side = "top",
}: SharePopoverProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const shareLinks = [
        {
            name: "X",
            icon: (
                <svg
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 fill-white"
                >
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
            ),
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
            color: "bg-black hover:bg-black/80",
        },
        {
            name: "Facebook",
            icon: <Facebook className="h-5 w-5 fill-white text-white" />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: "bg-[#1877F2] hover:bg-[#1877F2]/80",
        },
        {
            name: "LinkedIn",
            icon: <Linkedin className="h-5 w-5 fill-white text-white" />,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            color: "bg-[#0A66C2] hover:bg-[#0A66C2]/80",
        },
        {
            name: "Reddit",
            icon: (
                <svg
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 fill-white"
                >
                    <title>Reddit</title>
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                </svg>
            ),
            href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}`,
            color: "bg-[#FF4500] hover:bg-[#FF4500]/80",
        },
        {
            name: "VKontakte",
            icon: (
                <svg
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 fill-white"
                >
                    <title>VK</title>
                    <path d="M11.9,1C5.9,1,1,5.9,1,11.9s4.9,10.9,10.9,10.9h0c6,0,10.9-4.9,10.9-10.9S17.9,1,11.9,1z M17.3,14.6 c0.3,0.4,0.7,0.8,1,1.1c0.4,0.4,0.3,0.7-0.1,0.7h-1.6c-0.4,0-0.7-0.2-1-0.5c-0.3-0.3-0.7-0.7-1-1c-0.2-0.2-0.4-0.3-0.7-0.3 c-0.1,0-0.3,0.2-0.3,0.5v1.2c0,0.4-0.1,0.5-0.5,0.5h-1c-2.3,0-4.2-1.4-5.8-3.9c-2.3-3.6-4.5-7.6-4.5-8.1c0-0.2,0.1-0.4,0.4-0.4 h1.7c0.4,0,0.6,0.2,0.7,0.5c0.8,2.2,2.1,4.2,2.7,5.3c0.2,0.4,0.4,0.5,0.6,0.5c0.1,0,0.3-0.1,0.3-0.5V8.1c0-1.1-0.2-1.6-1.1-1.7 c-0.2,0-0.3-0.1-0.3-0.2c0-0.2,0.2-0.4,0.6-0.4h3.1c0.4,0,0.6,0.2,0.6,0.7v3.9c0,0.4,0.2,0.6,0.3,0.6c0.1,0,0.3-0.2,0.6-0.5 c1-1.2,1.8-2.9,2.2-4.1c0.1-0.2,0.3-0.4,0.6-0.4h1.6c0.5,0,0.6,0.3,0.5,0.7c-0.2,0.9-1,2.2-2.1,3.4c-0.3,0.4-0.5,0.7-0.4,1 c0.1,0.3,0.4,0.6,0.7,0.9c0.8,0.8,1.4,1.5,1.5,2.1C17.4,14.3,17.4,14.5,17.3,14.6z" />
                </svg>
            ),
            href: `https://vk.com/share.php?url=${encodeURIComponent(url)}`,
            color: "bg-[#0077FF] hover:bg-[#0077FF]/80",
        },
    ];

    const openShare = (href: string) => {
        window.open(href, "_blank", "width=600,height=400");
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="rounded-none gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent
                align={align}
                side={side}
                className="w-80 p-4 rounded-none border-border bg-popover"
            >
                <div className="grid gap-4">
                    <div className="flex gap-2 justify-start">
                        {shareLinks.map((platform) => (
                            <Button
                                key={platform.name}
                                size="icon"
                                className={`rounded-none h-10 w-10 ${platform.color} border-none hover:opacity-90 transition-opacity`}
                                onClick={() => openShare(platform.href)}
                                title={`Share on ${platform.name}`}
                            >
                                {platform.icon}
                            </Button>
                        ))}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="share-link" className="text-sm font-medium">
                            Video Link
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="share-link"
                                value={url}
                                readOnly
                                className="h-9 rounded-none bg-muted focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary"
                            />
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-9 w-9 rounded-none shrink-0"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
