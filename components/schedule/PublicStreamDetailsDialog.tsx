"use client";

import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Dumbbell, Bell, X } from "lucide-react";
import { ScheduledStream } from "@/hooks/explore";

interface PublicStreamDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stream: ScheduledStream | null;
}

export default function PublicStreamDetailsDialog({
    open,
    onOpenChange,
    stream,
}: PublicStreamDetailsDialogProps) {
    if (!stream) return null;

    const startDate = new Date(stream.startTime);
    const isToday = new Date().toDateString() === startDate.toDateString();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {/* Close Button */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute cursor-pointer right-4 top-4 p-1 opacity-70 hover:opacity-100 transition-opacity text-foreground"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <p className="mt-1">Upcoming Stream</p>
                    </DialogTitle>
                    <DialogDescription>
                        {isToday ? "Happening today!" : "Save the date"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Stream Title */}
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Title</p>
                        <p className="text-lg font-semibold text-foreground">{stream.title}</p>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Date
                            </p>
                            <p className="font-medium text-foreground">
                                {format(startDate, "EEEE, MMM d, yyyy")}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Time
                            </p>
                            <p className="font-medium text-foreground">
                                {format(startDate, "h:mm a")}
                            </p>
                        </div>
                    </div>

                    {/* Workout Type */}
                    {stream.workoutType && (
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Dumbbell className="w-3 h-3" />
                                Type
                            </p>
                            <p className="font-medium text-foreground">
                                {stream.workoutType}
                            </p>
                        </div>
                    )}

                    {/* Creator Info */}
                    <div className="bg-muted/50 p-3">
                        <p className="text-sm">
                            <span className="font-medium dark:text-white">Hosted by: </span>
                            <span className="text-primary font-medium">@{stream.creator.username}</span>
                        </p>
                    </div>

                    {/* Subscribe/Follow CTA */}
                    <div className="bg-primary/5 border border-primary/20 p-4 flex items-center gap-3">
                        <Bell className="w-5 h-5 text-primary shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">
                                Don&apos;t miss it!
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Follow or subscribe to get notified when they go live.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        <span className="mt-0.5">Close</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
