"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Video, Mic, Radio, Users, ArrowLeft, AlertTriangle } from "lucide-react";
import { creatorService } from "@/services/creator";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CATEGORIES } from "@/lib/categories";
import { SkeletonLiveStream } from "@/components/ui/skeleton-variants";

// Dynamic import to avoid SSR issues with Agora (uses window)
const AgoraLiveStream = dynamic(() => import("@/components/live/AgoraLiveStream"), { ssr: false })

/**
 * Preview/Go Live page - No stream ID in URL
 * This page is ONLY for preview and setup.
 * When "Go Live" is clicked, it redirects to /creator/live/[id] where the actual live streaming happens.
 */
export default function CreatorLivePreviewPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Stream setup state
    const [streamTitle, setStreamTitle] = useState("");
    const [streamType, setStreamType] = useState("");
    const [isGoingLive, setIsGoingLive] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const canGoLive = streamTitle.trim() !== "" && streamType.trim() !== "" && hasPermission !== false;

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

    // Handle going live - create stream and redirect to live page
    const handleGoLive = async () => {
        if (!session?.user?.id) return;
        setIsGoingLive(true);

        try {
            // Create stream in backend and get Agora token
            const response = await creatorService.createStream({
                title: streamTitle,
                workoutType: streamType,
                startTime: new Date().toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                creatorId: session.user.id,
                isScheduled: false,
            });

            if (response.success && response.stream?.id) {
                toast.success("You're live! 🎬");
                // Redirect to the live page with the stream ID
                router.replace(`/creator/live/${response.stream.id}`);
            } else {
                toast.error("Something went wrong. Please try again.")
                console.warn("Backend API not configured.");
            }
        } catch (error: unknown) {
            toast.error("Failed to start stream. Please try again.");
            console.error("Go Live Error:", error);
        } finally {
            setIsGoingLive(false);
        }
    };

    // Handle permission change
    const handlePermissionChange = useCallback((hasPermission: boolean) => {
        setHasPermission(hasPermission);
    }, []);

    // Show loading only for auth
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <SkeletonLiveStream />
                        </div>
                        <div className="space-y-4">
                            <div className="rounded-xl border border-border/20 p-4 space-y-3">
                                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (status === "unauthenticated") {
        router.push("/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/creator/schedule")}
                        >
                            <ArrowLeft className="w-5 h-5 dark:text-white" />
                        </Button>
                        <div>
                            <h1 className="font-semibold text-foreground">Stream Preview</h1>
                            <p className="text-sm text-muted-foreground">
                                Test your setup before going live
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Preview */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative">
                            {/* AgoraLiveStream in preview mode */}
                            <AgoraLiveStream
                                appId={appId}
                                channelName="preview"
                                token=""
                                uid={Math.floor(Math.random() * 100000)}
                                streamId="preview"
                                isLive={false}
                                onStreamEnd={() => { }}
                                onRecordingReady={() => { }}
                                onPermissionChange={handlePermissionChange}
                            />

                            {/* Go Live Button Overlay */}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
                                {/* Logo - Top Left */}
                                <Image
                                    src='/buck.svg'
                                    alt='go live'
                                    width={40}
                                    height={40}
                                    className="absolute top-4 left-4"
                                />
                                {/* Status Badge - Top Right */}
                                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                                    <span className="w-2 h-2 rounded-full bg-white/70" />
                                    Preview
                                </div>
                                <div className="text-center space-y-6 p-8">
                                    <div className={cn(
                                        "sm:w-20 sm:h-20 sm:flex hidden rounded-full items-center justify-center mx-auto",
                                        hasPermission === false ? "bg-yellow-500/20" : "bg-destructive/20"
                                    )}>
                                        {hasPermission === false ? (
                                            <AlertTriangle className="w-10 h-10 text-yellow-500" />
                                        ) : (
                                            <Radio className="sm:w-10 sm:h-10 text-destructive w-4 h-4" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2 hidden sm:block">
                                            {hasPermission === false ? "Permission Required" : "Ready to go live?"}
                                        </h2>
                                        <p className="text-white/70 sm:block hidden">
                                            {hasPermission === false
                                                ? "Please allow camera and microphone access"
                                                : hasPermission === true
                                                    ? "Your camera and microphone are ready"
                                                    : "Checking camera and microphone..."
                                            }
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 items-center">
                                        <Button
                                            onClick={handleGoLive}
                                            disabled={isGoingLive || !canGoLive}
                                            size="lg"
                                            className="bg-destructive hover:bg-destructive/90 text-white px-6 py-4 text-base rounded-full shadow-lg disabled:opacity-50 w-auto"
                                        >
                                            <Radio className="w-5 h-5 mr-2" />
                                            <p className="mt-1">{isGoingLive ? "Starting..." : "Go Live"}</p>
                                        </Button>
                                        {hasPermission === false && (
                                            <Button
                                                onClick={() => {
                                                    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                                                        .then(() => setHasPermission(true))
                                                        .catch(() => setHasPermission(false));
                                                }}
                                                variant="outline"
                                                size="lg"
                                                className="text-white border-white/30 hover:bg-white/10 px-8 py-6 text-lg rounded-full"
                                            >
                                                Grant Permissions
                                            </Button>
                                        )}
                                    </div>
                                    {/* Status Indicators */}
                                    <div className="flex items-center justify-center gap-6 mt-4">
                                        <div className="flex items-center gap-2 text-white/80 text-sm">
                                            <Video className={cn(
                                                "w-4 h-4",
                                                hasPermission === false ? "text-red-400" : "text-green-400"
                                            )} />
                                            <span className="mt-1 max-sm:text-xs">{hasPermission === false ? "Camera blocked" : "Camera ready"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/80 text-sm">
                                            <Mic className={cn(
                                                "w-4 h-4",
                                                hasPermission === false ? "text-red-400" : "text-green-400"
                                            )} />
                                            <span className="mt-1 max-sm:text-xs">{hasPermission === false ? "Mic blocked" : "Mic ready"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/80 text-sm">
                                            <Users className="w-4 h-4 text-blue-400" />
                                            <span className="mt-1 max-sm:text-xs">Followers and Subscribers will be notified via email</span>
                                        </div>
                                    </div>
                                    <div className="text-gray-400 text-sm font-black">
                                        To go live, fill in the title and select the stream type.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Setup Form */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Stream Setup</CardTitle>
                                {(!streamTitle.trim() || !streamType.trim()) && (
                                    <p className="text-xs text-muted-foreground">
                                        * Please fill in both fields to enable Go Live
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="streamTitle">Title</Label>
                                    <Input
                                        id="streamTitle"
                                        value={streamTitle}
                                        onChange={(e) => setStreamTitle(e.target.value)}
                                        placeholder="Enter your stream title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="streamType">Stream Type</Label>
                                    <Select
                                        value={streamType}
                                        onValueChange={setStreamType}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select workout type" />
                                        </SelectTrigger>
                                        <SelectContent className="border border-border">
                                            {CATEGORIES.map((category) => (
                                                <SelectItem key={category.id} value={category.name}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
