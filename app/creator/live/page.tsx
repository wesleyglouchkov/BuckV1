"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { creatorService } from "@/services/creator";
import { SkeletonLiveStream } from "@/components/ui/skeleton-variants";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import StreamPreviewOverlay from "@/components/live/StreamPreviewOverlay";
import StreamSetupCard from "@/components/live/StreamSetupCard";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    const [showPriceAlert, setShowPriceAlert] = useState(false);
    const [showStripeAlert, setShowStripeAlert] = useState({
        open: false,
        route: "",
    });

    const canGoLive = streamTitle.trim() !== "" && streamType.trim() !== "" && hasPermission !== false;

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

    // Handle going live - create stream and redirect to live page
    const handleGoLive = async () => {
        if (!session?.user?.id) return;
        setIsGoingLive(true);

        // Fetch latest profile to check stripe connection and subscription price
        try {
            const profileResponse = await creatorService.getUserProfile("CREATOR");
            const userProfile = profileResponse.data;

            // 1. Check Stripe Connection first
            if (userProfile && (!userProfile.stripe_connected || !userProfile.stripe_onboarding_completed)) {
                setShowStripeAlert({
                    open: true,
                    route: !userProfile.stripe_connected ? "/creator/profile" : "/creator/stripe/refresh",
                });
                setIsGoingLive(false);
                return;
            }

            // 2. Check Subscription Price
            const price = userProfile?.subscriptionPrice ? Number(userProfile.subscriptionPrice) : 0;

            if (price === 0) {
                setShowPriceAlert(true);
                setIsGoingLive(false);
                return;
            }
        } catch (error) {
            console.error("Failed to fetch profile for price check", error);
            toast.error("Could not verify subscription status. Please try again.");
            setIsGoingLive(false);
            return;
        }

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
                setIsGoingLive(false); // Reset if API call fails but doesn't throw
            }
        } catch (error: unknown) {
            toast.error("Failed to start stream. Please try again.");
            console.error("Go Live Error:", error);
            setIsGoingLive(false); // Ensure reset on error
        }
    };

    // Handle permission change
    const handlePermissionChange = useCallback((hasPermission: boolean) => {
        setHasPermission(hasPermission);
    }, []);

    const handleGrantPermissions = () => {
        // Request permissions again
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(() => setHasPermission(true))
            .catch(() => setHasPermission(false));
    };

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
                    <ThemeToggle />
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Preview */}
                    <div className="lg:col-span-2 space-y-4 order-2 lg:order-0">
                        <div className="relative">
                            {/* AgoraLiveStream in preview mode - handles overlay internally */}
                            <AgoraLiveStream
                                appId={appId}
                                channelName="preview"
                                token=""
                                rtmToken=""
                                uid={Math.floor(Math.random() * 100000)}
                                streamId="preview"
                                isLive={false}
                                onStreamEnd={() => { }}
                                onRecordingReady={() => { }}
                                onPermissionChange={handlePermissionChange}
                                recordingDetails={null}
                                setRecordingDetails={() => { }}
                                isRecording={false}
                                setIsRecording={() => { }}
                                // New props for Preview Mode Overlay
                                isGoingLive={isGoingLive}
                                onGoLive={handleGoLive}
                                streamTitle={streamTitle}
                                streamType={streamType}
                                hasPermission={hasPermission}
                                onGrantPermissions={handleGrantPermissions}
                            />
                        </div>
                    </div>

                    {/* Sidebar - Setup Form */}
                    <div className="space-y-4 order-1 lg:order-0">
                        <StreamSetupCard
                            title={streamTitle}
                            onTitleChange={setStreamTitle}
                            type={streamType}
                            onTypeChange={setStreamType}
                        />
                    </div>
                </div>
            </div>

            <AlertDialog open={showStripeAlert.open} onOpenChange={() => setShowStripeAlert({ open: false, route: "" })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Connect Stripe Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            To ensure you can receive payments and access all creator features, please connect your Stripe account before going live.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            router.push(showStripeAlert.route);
                        }}>
                            Connect Stripe
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showPriceAlert} onOpenChange={setShowPriceAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Set Monthly Subscription Plan</AlertDialogTitle>
                        <AlertDialogDescription>
                            You need to set a subscription price for your community before you can go live.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.push("/creator/community")}>
                            Set Monthly Subscription Price
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
