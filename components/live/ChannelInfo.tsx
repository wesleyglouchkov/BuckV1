import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Heart, Star } from "lucide-react";
import { SubscribeDialog } from "./subscribe/SubscribeDialog";
import { cn } from "@/lib/utils";

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
    };
    isFollowed?: boolean;
    isSubscribed?: boolean;
}

export function ChannelInfo({ creator, isFollowed = false, isSubscribed = false }: ChannelInfoProps) {
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
                    <Button
                        variant={isFollowed ? "default" : "outline"}
                        className={cn(
                            "flex-1 sm:flex-none gap-2 rounded-none font-semibold transition-all hover:scale-105 active:scale-95",
                            isFollowed
                                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20 shadow-lg"
                                : "text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white"
                        )}
                    >
                        <Heart className={cn("w-4 h-4", isFollowed ? "fill-current" : "")} />
                        {isFollowed ? "Following" : "Follow"}
                    </Button>

                    {!isSubscribed && (
                        <SubscribeDialog creator={creator}>
                            <Button variant="secondary" className="flex-1 sm:flex-none gap-2 rounded-none font-semibold bg-secondary/80 hover:bg-secondary transition-all hover:scale-105 active:scale-95">
                                <Star className="w-4 h-4" />
                                Subscribe
                            </Button>
                        </SubscribeDialog>
                    )}
                </div>
            </div>

            {/* Bio Section - Inside ChannelInfo */}
            {creator.bio && (
                <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                        {creator.bio}
                    </p>
                </div>
            )}
        </div>
    );
}
