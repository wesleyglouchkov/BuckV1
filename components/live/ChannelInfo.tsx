import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Heart, Star } from "lucide-react";

interface ChannelInfoProps {
    creator: {
        id: string;
        name: string;
        avatar?: string;
        followers?: number;
    };
    lastLive?: string; // e.g. "8 days ago"
}

export function ChannelInfo({ creator, lastLive = "2 days ago" }: ChannelInfoProps) {
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
                        <p className="text-sm text-muted-foreground mt-0.5">
                            last live {lastLive}
                        </p>
                        <p className="text-sm font-medium text-foreground mt-1">
                            {creator.followers ? (creator.followers / 1000000).toFixed(1) + "M" : "5.7M"} followers
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-lg font-semibold shadow-purple-500/20 shadow-lg transition-all hover:scale-105 active:scale-95">
                        <Heart className="w-4 h-4 fill-current" />
                        Follow
                    </Button>
                    <Button variant="secondary" className="flex-1 sm:flex-none gap-2 rounded-lg font-semibold bg-secondary/80 hover:bg-secondary transition-all hover:scale-105 active:scale-95">
                        <Star className="w-4 h-4" />
                        Subscribe
                    </Button>
                </div>
            </div>
        </div>
    );
}
