"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Heart, Star, StarOff, Loader2 } from "lucide-react";
import { SubscribeDialog } from "./subscribe/SubscribeDialog";
import { UnsubscribeDialog } from "./subscribe/UnsubscribeDialog";
import { cn } from "@/lib/utils";
import { memberService } from "@/services/member";
import { toast } from "sonner";
import { LoginRequiredDialog } from "./LoginRequiredDialog";

interface ChannelInfoProps {
    creator: {
        id: string;
        name: string;
        username?: string;
        avatar?: string;
        followers?: number;
        subscribers?: number;
        subscriptionPrice?: number | null;
        bio?: string;
        stripe_account_id?: string | null;
        stripe_connected?: boolean | null;
        stripe_onboarding_completed?: boolean | null;
    };
    isSubscribed?: boolean;
    onFollowChange?: (isFollowing: boolean) => void;
}

export function ChannelInfo({ creator, isSubscribed: initialIsSubscribed = false, onFollowChange }: ChannelInfoProps) {
    const { data: session, status } = useSession();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isSubscribedState, setIsSubscribedState] = useState(initialIsSubscribed);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUnsubscribing, setIsUnsubscribing] = useState(false);

    const [isCheckingStatus, setIsCheckingStatus] = useState(true);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    // Check follow and subscription status on mount
    useEffect(() => {
        const checkStatus = async () => {
            // Only check if user is logged in as a member
            if (status !== "authenticated" || session?.user?.role?.toUpperCase() !== "MEMBER") {
                setIsCheckingStatus(false);
                return;
            }

            try {
                const result = await memberService.getCreatorRelationship(creator.id);
                setIsFollowing(result.isFollowing);
                setIsSubscribedState(result.isSubscribed);
                setSubscriptionId(result.subscriptionId);
            } catch (error) {
                // Silently fail - user might not be following
                console.error("Failed to check relationship status:", error);
            } finally {
                setIsCheckingStatus(false);
            }
        };

        if (creator.id) {
            checkStatus();
        }
    }, [creator.id, session, status]);

    // Handle follow/unfollow
    const handleFollowToggle = useCallback(async () => {

        if (status !== "authenticated") {
            setShowLoginDialog(true);
            return;
        }

        if (session?.user?.role?.toUpperCase() !== "MEMBER") {
            toast.error("Only members can follow creators");
            return;
        }

        setIsLoading(true);
        try {
            if (isFollowing) {
                await memberService.unfollowCreatorById(creator.id);
                setIsFollowing(false);
                toast.success(`Unfollowed ${creator.name}`);
                onFollowChange?.(false);
            } else {
                await memberService.followCreatorById(creator.id);
                setIsFollowing(true);
                toast.success(`Now following ${creator.name}`);
                onFollowChange?.(true);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update follow status");
        } finally {
            setIsLoading(false);
        }
    }, [creator.id, creator.name, isFollowing, session, status, onFollowChange]);

    // Handle unsubscribe
    const handleUnsubscribe = useCallback(async () => {
        if (!subscriptionId) {
            toast.error("No subscription found");
            return;
        }

        setIsUnsubscribing(true);
        try {
            await memberService.cancelSubscription(subscriptionId);
            setIsSubscribedState(false);
            setSubscriptionId(null);
            toast.success(`Unsubscribed from ${creator.name}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to unsubscribe");
        } finally {
            setIsUnsubscribing(false);
        }
    }, [subscriptionId, creator.name]);

    // Format count (followers/subscribers)
    const formatCount = (count?: number) => {
        if (!count && count !== 0) return "0";
        if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
        if (count >= 1000) return (count / 1000).toFixed(1) + "K";
        return count.toString();
    };

    // Format subscription price
    const formatPrice = (price?: number | null) => {
        if (!price) return null;
        return `$${price}/month`;
    };

    // Check if current user is the creator (can't follow yourself)
    const isOwnProfile = session?.user?.id === creator.id;
    const isMember = session?.user?.role?.toUpperCase() === "MEMBER";
    const showFollowButton = !isOwnProfile && (isMember || status !== "authenticated");

    return (
        <div className="w-full bg-card border-b border-border p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <UserAvatar
                        src={creator.avatar}
                        name={creator.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-background shadow-sm"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                                {creator.name}
                            </h2>
                            {/* Verified Badge */}
                            <svg className="w-5 h-5 text-blue-500 fill-current" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                        </div>

                        {/* Username */}
                        {creator.username && (
                            <p className="text-sm text-muted-foreground">
                                @{creator.username}
                            </p>
                        )}

                        {/* Stats Row: Followers, Subscribers, Subscription Price */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-sm">
                                <span className="font-semibold text-foreground">{formatCount(creator.followers)}</span>
                                <span className="text-muted-foreground ml-1">followers</span>
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm">
                                <span className="font-semibold text-foreground">{formatCount(creator.subscribers)}</span>
                                <span className="text-muted-foreground ml-1">subscribers</span>
                            </span>
                            {formatPrice(creator.subscriptionPrice) && (
                                <>
                                    <div className="flex text-sm font-medium text-primary gap-1">
                                        <Star className="w-4 h-4" /> <b> {formatPrice(creator.subscriptionPrice)}</b>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {showFollowButton && (
                        <Button
                            variant={isFollowing ? "default" : "outline"}
                            onClick={handleFollowToggle}
                            disabled={isLoading || isCheckingStatus}
                            className={cn(
                                "flex-1 sm:flex-none gap-2 rounded-none font-semibold transition-all hover:scale-105 active:scale-95",
                                isFollowing
                                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20 shadow-lg"
                                    : "text-purple-600 border-purple-600 "
                            )}
                        >
                            {isLoading || isCheckingStatus ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Heart className={cn("w-4 h-4", isFollowing ? "fill-current" : "")} />
                            )}
                            {isFollowing ? "Following" : "Follow"}
                        </Button>
                    )}

                    {/* Subscribe/Unsubscribe Button - Show for all roles except the owner */}
                    {!isOwnProfile &&
                        creator.stripe_account_id &&
                        creator.stripe_connected &&
                        creator.stripe_onboarding_completed && (
                            isSubscribedState ? (
                                // Already subscribed - show Subscribed button with unsubscribe dialog
                                <UnsubscribeDialog creator={creator} onConfirm={handleUnsubscribe}>
                                    <Button
                                        variant="secondary"
                                        disabled={isUnsubscribing || isCheckingStatus}
                                        className="flex-1 sm:flex-none gap-2 rounded-none font-semibold bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-105 active:scale-95"
                                    >
                                        {isUnsubscribing ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Star className="w-4 h-4 fill-current" />
                                        )}
                                        Subscribed
                                    </Button>
                                </UnsubscribeDialog>
                            ) : status === "authenticated" ? (
                                // Not subscribed and logged in - show Subscribe dialog
                                <SubscribeDialog creator={creator}>
                                    <Button variant="secondary" className="flex-1 sm:flex-none gap-2 rounded-none font-semibold bg-secondary/80 hover:bg-secondary transition-all hover:scale-105 active:scale-95">
                                        <Star className="w-4 h-4" />
                                        Subscribe
                                    </Button>
                                </SubscribeDialog>
                            ) : (
                                // Not logged in - show login prompt
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowLoginDialog(true)}
                                    className="flex-1 sm:flex-none gap-2 rounded-none font-semibold bg-secondary/80 hover:bg-secondary transition-all hover:scale-105 active:scale-95"
                                >
                                    <Star className="w-4 h-4" />
                                    Subscribe
                                </Button>
                            )
                        )}
                </div>
            </div>

            <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />

            {/* Bio Section - Inside ChannelInfo
            {creator.bio && (
                <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                        {creator.bio}
                    </p>
                </div>
            )} */}
        </div>
    );
}
