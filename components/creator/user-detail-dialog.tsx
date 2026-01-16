"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, User, Shield, Star, Clock } from "lucide-react";
import { formatDate } from "@/utils/dateTimeUtils";

interface UserDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: any; // Can be a subscriber or follower object
    type: "subscriber" | "follower";
}

export function UserDetailDialog({ isOpen, onClose, user, type }: UserDetailDialogProps) {
    if (!user) return null;

    const userData = type === "subscriber" ? user.member : user.follower;
    const stats = [
        { label: "Email", value: userData.email, icon: Mail },
        { label: "Username", value: `@${userData.username}`, icon: User },
        {
            label: type === "subscriber" ? "Subscribed Since" : "Followed Since",
            value: formatDate(type === "subscriber" ? user.startDate : user.createdAt),
            icon: Calendar
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-border/20 bg-card">
                <DialogHeader className="p-4 pb-0">
                    <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        {type === "subscriber" ? <Star className="w-4 h-4 text-primary fill-primary" /> : <Shield className="w-4 h-4 text-primary" />}
                        {type === "subscriber" ? "Subscriber Details" : "Follower Details"}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 pt-4">
                    <div className="flex items-center gap-4 mb-6 bg-muted/20 p-3 border border-border/10">
                        <UserAvatar
                            src={userData.avatar}
                            name={userData.name}
                            className="w-16 h-16 border-2 border-primary/20 shadow-md"
                        />
                        <div className="flex flex-col">
                            <h3 className="text-xl font-bold text-foreground leading-tight">{userData.name}</h3>
                            <p className="text-muted-foreground text-sm italic">@{userData.username}</p>
                            {type === "subscriber" && (
                                <Badge className="mt-1 w-fit bg-primary text-white rounded-none border-none px-2 py-0 text-[9px] font-black uppercase tracking-widest">
                                    Active Subscriber
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-muted/30 border border-border/5">
                                <stat.icon className="w-3.5 h-3.5 text-primary opacity-70" />
                                <div className="flex items-center justify-between flex-1">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                                    <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">{stat.value}</span>
                                </div>
                            </div>
                        ))}

                        {type === "subscriber" && (
                            <div className="mt-2 p-3 bg-primary/5 border-l-2 border-primary/30">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Subscription</span>
                                    <span className="text-sm font-black text-foreground">${user.fee}/mo</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 rounded-none uppercase text-[9px] font-black px-1.5 py-0">
                                        {user.status}
                                    </Badge>
                                    {user.endDate && (
                                        <p className="text-[10px] text-muted-foreground italic">
                                            Next: {formatDate(user.endDate)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-3 bg-muted/50 border-t border-border/10 flex justify-end">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="dark:text-white rounded-none hover:bg-background h-8 px-4 font-bold uppercase tracking-widest text-[10px]"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
