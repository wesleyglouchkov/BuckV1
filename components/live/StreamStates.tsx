"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Check, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import VideoPlayer from "@/components/live/VideoPlayer";
import { getSignedStreamUrl } from "@/app/actions/s3-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { memberService } from "@/services/member";
import { StripeSubscription } from "./subscribe/StripeSubscription";
import { UserAvatar } from "@/components/ui/user-avatar";




/**
 * Shown when stream is connecting (live stream, waiting for Agora to connect)
 */
export function StreamConnecting({ creatorName }: { creatorName: string }) {
    return (
        <div className="w-full h-[calc(100dvh-70px)] bg-linear-to-br from-card to-muted flex items-center justify-center border border-border">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Connecting to Stream
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Joining {creatorName}&apos;s live stream...
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Shown when a recorded stream replay is available
 */
interface StreamReplayProps {
    replayUrl: string;
    streamTitle: string;
    creator: {
        id: string;
        name: string;
        username?: string;
        avatar?: string;
        subscriptionPrice?: number | null;
        stripe_account_id?: string | null;
        stripe_connected?: boolean | null;
        stripe_onboarding_completed?: boolean | null;
    };
}

export function StreamReplay({ replayUrl, streamTitle, creator }: StreamReplayProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status: authStatus } = useSession();

    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subscribeStep, setSubscribeStep] = useState<"details" | "payment">("details");
    const [showOverlayDelayed, setShowOverlayDelayed] = useState(false);

    // Check subscription status using SWR - for any authenticated non-owner
    const isOwner = session?.user?.id === creator.id;
    const isMember = session?.user?.role?.toUpperCase() === "MEMBER";
    const isCreator = session?.user?.role?.toUpperCase() === "CREATOR";
    const shouldCheckSubscription = authStatus === "authenticated" && !isOwner && creator.id;

    const { data: relationshipData, isLoading: isCheckingRelationship } = useSWR(
        shouldCheckSubscription ? `/member/relationship/${creator.id}` : null,
        async () => {
            const result = await memberService.getCreatorRelationship(creator.id);
            return result;
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000,
        }
    );

    const isSubscribed = relationshipData?.isSubscribed ?? false;

    // Determine if we should show the subscribe overlay
    // Show if: (unauthenticated OR (authenticated + not owner)) + creator has stripe setup + not subscribed
    const showSubscribeOverlay =
        !isOwner &&
        !isCheckingRelationship &&
        !isSubscribed &&
        creator.stripe_account_id &&
        creator.stripe_connected &&
        creator.stripe_onboarding_completed &&
        (authStatus === "unauthenticated" || isMember || isCreator);

    // Delay showing the overlay by 0.5 seconds
    useEffect(() => {
        if (showSubscribeOverlay) {
            const timer = setTimeout(() => {
                setShowOverlayDelayed(true);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setShowOverlayDelayed(false);
        }
    }, [showSubscribeOverlay]);

    const benefits = [
        "Subscriber-only chat mode",
        "Access to subscriber-only streams"
    ];

    useEffect(() => {
        const fetchSignedUrl = async () => {
            try {
                const url = await getSignedStreamUrl(replayUrl);
                if (url) {
                    setSignedUrl(url);
                } else {
                    setError("Could not load video");
                }
            } catch (err) {
                console.error("Error fetching signed URL:", err);
                setError("Could not load video");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSignedUrl();
    }, [replayUrl]);

    if (isLoading || isCheckingRelationship) {
        return (
            <div className="w-full h-[calc(100dvh-70px)]">
                <Skeleton className="w-full h-full" />
            </div>
        );
    }

    if (error || !signedUrl) {
        return (
            <div className="w-full aspect-video bg-linear-to-br from-card to-muted flex items-center justify-center border border-border">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">{error || "Video not available"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full relative">
            <div className="h-[calc(100dvh-70px)]">
                <VideoPlayer
                    src={signedUrl}
                    title={streamTitle}
                />
            </div>

            {/* Subscribe Overlay - shown if user is not subscribed */}
            {showOverlayDelayed && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70">
                    <div className="w-full max-w-[420px] mx-4 bg-card border border-border shadow-2xl overflow-hidden">
                        {subscribeStep === "details" ? (
                            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {/* Header Banner */}
                                <div className="relative h-32 bg-linear-to-b from-primary/20 to-card/5 p-6 flex flex-col items-center justify-center border-b border-border/50">
                                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary blur-3xl rounded-full" />
                                        <div className="absolute top-10 -left-10 w-24 h-24 bg-secondary blur-3xl rounded-full" />
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center">
                                        <UserAvatar
                                            src={creator.avatar}
                                            name={creator.name}
                                            rounded
                                            className="w-16 h-16 border-4 border-card shadow-lg mb-2"
                                        />
                                        <h2 className="text-lg font-bold flex items-center gap-1.5 text-foreground">
                                            Subscribe to {creator.name}
                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                        </h2>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Monthly Price */}
                                    <div className="text-center space-y-1">
                                        <div className="flex items-baseline justify-center gap-1">
                                            {creator.subscriptionPrice && <>
                                                <span className="text-3xl font-bold text-foreground">${creator.subscriptionPrice} USD</span>
                                                <span className="text-muted-foreground font-medium">/ month</span>
                                            </>}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Cancel anytime. Stripe Secure payment.</p>
                                    </div>

                                    {/* Benefits List */}
                                    <div className="space-y-3 bg-muted/30 p-4 border border-border/50 rounded-none">
                                        <div className="flex items-center gap-2 text-sm font-medium mb-2 text-primary">
                                            <Crown className="w-4 h-4" />
                                            <span>Subscriber Benefits</span>
                                        </div>
                                        {benefits.map((benefit, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="mt-0.5 min-w-4 min-h-4 bg-primary/10 flex items-center justify-center rounded-none">
                                                    <Check className="w-2.5 h-2.5 text-primary" />
                                                </div>
                                                <span className="text-sm text-foreground/90">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        onClick={() => {
                                            if (authStatus === "unauthenticated") {
                                                router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
                                            } else {
                                                setSubscribeStep("payment");
                                            }
                                        }}
                                        className="w-full h-12 text-base font-semibold bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-none"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        {authStatus === "unauthenticated" ? "Sign In to Subscribe" : "Subscribe Now"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Minimal Header for Payment Step */}
                                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/10">
                                    <h3 className="font-semibold flex items-center gap-2 text-foreground">
                                        <Star className="w-4 h-4 text-primary" />
                                        Review & Pay
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSubscribeStep("details")}
                                        className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-none"
                                    >
                                        Back
                                    </Button>
                                </div>

                                <div className="p-0">
                                    <StripeSubscription creatorId={creator.id} onCancel={() => setSubscribeStep("details")} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Shown when stream is scheduled but hasn't started yet
 */
export function StreamScheduled({ startTime }: { startTime: string }) {
    const router = useRouter();

    return (
        <div className="w-full h-[calc(100dvh-70px)] bg-linear-to-br from-card to-muted flex items-center justify-center border border-border">
            <div className="text-center space-y-6 max-w-md px-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-primary" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold dark:text-white">Upcoming Stream</h2>
                    <p className="text-muted-foreground">
                        This stream is scheduled to start on
                    </p>
                    <div className="text-xl font-semibold text-primary">
                        {format(new Date(startTime), "MMMM d, yyyy 'at' h:mm a")}
                    </div>
                </div>

                <div className="pt-4">
                    <Button onClick={() => router.push("/explore")} variant="outline">
                        Back to Explore
                    </Button>
                </div>
            </div>
        </div>
    );
}

/**
 * Shown when stream has ended with no replay available
 */
export function StreamEnded() {
    const router = useRouter();

    return (
        <div className="w-full h-[calc(100dvh-70px)] bg-linear-to-br from-card to-muted flex items-center justify-center border border-border">
            <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                    This stream has ended and no replay is available.
                </p>
                <Button onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        </div>
    );
}
