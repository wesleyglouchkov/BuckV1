import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TopCreator } from "@/services/admin";
import {
    Mail,
    Star,
    User,
    FileText,
    Activity,
    DollarSign,
    Calendar,
    X
} from "lucide-react";

interface CreatorProfileDialogProps {
    creator: TopCreator | null;
    isOpen: boolean;
    onClose: () => void;
}

export function CreatorProfileDialog({ creator, isOpen, onClose }: CreatorProfileDialogProps) {
    if (!creator) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Close button in top right */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <DialogHeader>
                    <DialogTitle className="text-2xl dark:text-white">Creator Profile</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-border/30">
                        <UserAvatar src={creator.avatar} name={creator.name} size="xl" />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-foreground">{creator.name}</h2>
                            <p className="text-muted-foreground">@{creator.username}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{creator.email}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                                    Creator
                                </span>
                                {creator.stripeConnected && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                        Stripe Connected
                                    </span>
                                )}
                                {creator.warningCount > 0 && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                        {creator.warningCount} {creator.warningCount === 1 ? 'warning' : 'warnings'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {creator.bio && (
                        <div className="p-4 bg-muted/50 rounded-lg border border-border/20">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Bio</h3>
                            <p className="text-foreground">{creator.bio}</p>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-card rounded-lg border border-border/30 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-500" />
                                </div>
                                <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                            </div>
                            <p className="text-2xl font-bold text-green-500">${creator.revenue.toLocaleString()}</p>
                        </div>

                        <div className="p-4 bg-card rounded-lg border border-border/30 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                </div>
                                <h3 className="text-sm font-medium text-muted-foreground">Followers</h3>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{creator.followers.toLocaleString()}</p>
                        </div>

                        <div className="p-4 bg-card rounded-lg border border-border/30 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-purple-500" />
                                </div>
                                <h3 className="text-sm font-medium text-muted-foreground">Subscribers</h3>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{creator.subscriberCount.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-card rounded-lg border border-border/30 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-orange-500" />
                                </div>
                                <h3 className="text-sm font-medium text-muted-foreground">Total Streams</h3>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{creator.totalStreams}</p>
                        </div>

                        <div className="p-4 bg-card rounded-lg border border-border/30 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-red-500" />
                                </div>
                                <h3 className="text-sm font-medium text-muted-foreground">Warning Count</h3>
                            </div>
                            <p className={`text-2xl font-bold ${creator.warningCount >= 5 ? 'text-red-500' :
                                    creator.warningCount >= 3 ? 'text-orange-500' :
                                        creator.warningCount >= 1 ? 'text-yellow-500' :
                                            'text-green-500'
                                }`}>
                                {creator.warningCount}
                            </p>
                        </div>

                        <div className="p-4 bg-card rounded-lg border border-border/30 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-blue-500" />
                                </div>
                                <h3 className="text-sm font-medium text-muted-foreground">Subscription Price</h3>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {creator.subscriptionPrice ? `$${creator.subscriptionPrice}` : 'Not set'}
                            </p>
                        </div>
                    </div>

                    {/* Join Date */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-border/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-muted-foreground">Joined</h3>
                        </div>
                        <p className="text-sm text-foreground">
                            {new Date(creator.joinedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
