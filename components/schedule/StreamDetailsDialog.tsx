"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Dumbbell, Radio, Trash2, Edit, X, Play } from "lucide-react";
import { StreamEvent } from "./StreamCalendar";
import { toast } from "sonner";
import { CopyableField } from "@/components/ui/copyable-field";

interface StreamDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stream: StreamEvent | null;
    onStartStream: (stream: StreamEvent) => void;
    onCancelStream: (stream: StreamEvent) => Promise<void>;
    onReschedule: (stream: StreamEvent) => void;
}

export default function StreamDetailsDialog({
    open,
    onOpenChange,
    stream,
    onStartStream,
    onCancelStream,
    onReschedule,
}: StreamDetailsDialogProps) {
    const [isCancelling, setIsCancelling] = useState(false);
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);

    if (!stream) return null;

    const handleConfirmCancel = async () => {
        setIsCancelling(true);
        try {
            await onCancelStream(stream);
            setShowConfirmCancel(false);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to cancel stream:", error);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleStartStream = () => {
        onStartStream(stream);
        onOpenChange(false);
    };

    const handleReschedule = () => {
        onReschedule(stream);
        onOpenChange(false);
    };

    const isLive = stream.resource?.isLive;
    const isPast = stream.start < new Date();

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    {/* Close Button */}
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute cursor-pointer right-4 top-4 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity text-foreground"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>

                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isLive ? (
                                <span className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                                    </span>
                                    Live Now
                                </span>
                            ) : (
                                <>
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <p className="mt-1">Scheduled Stream</p>
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {isLive
                                ? "This stream is currently live"
                                : isPast
                                    ? "This stream was scheduled for a past time"
                                    : "View and manage your scheduled stream"}
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
                                    {format(stream.start, "EEEE, MMM d, yyyy")}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Time
                                </p>
                                <p className="font-medium text-foreground">
                                    {format(stream.start, "h:mm a")}
                                </p>
                            </div>
                        </div>

                        {/* Workout Type */}
                        {stream.resource?.workoutType && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Dumbbell className="w-3 h-3" />
                                    Workout Type
                                </p>
                                <p className="font-medium text-foreground">
                                    {stream.resource.workoutType}
                                </p>
                            </div>
                        )}

                        {/* Status */}
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm">
                                <span className="font-medium dark:text-white">Status: </span>
                                {isLive ? (
                                    <span className="text-destructive font-medium">🔴 Live</span>
                                ) : isPast ? (
                                    <span className="text-muted-foreground">Ended</span>
                                ) : (
                                    <span className="text-primary font-medium">Scheduled</span>
                                )}
                            </p>
                        </div>

                        {/* Replay URL for past streams */}
                        {isPast && stream.resource?.replayUrl && (
                            <CopyableField
                                label={
                                    <>
                                        <Play className="w-3 h-3" />
                                        Replay URL
                                    </>
                                }
                                value={stream.resource.replayUrl}
                                toastMessage="Replay URL copied!"
                            />
                        )}
                    </div>

                    <DialogFooter className="flex flex-row gap-2 justify-end">
                        {!isLive && !isPast && (
                            <>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowConfirmCancel(true)}
                                    className="whitespace-nowrap text-sm"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    <span className="mt-1">Cancel</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReschedule}
                                    className="whitespace-nowrap text-sm"
                                >
                                    <Edit className="w-3 h-3 mr-1" />
                                    <span className="mt-1">Reschedule</span>
                                </Button>
                            </>
                        )}
                        <Button
                            size="sm"
                            onClick={handleStartStream}
                            disabled={isPast && !isLive}
                            variant={isPast && !isLive ? "secondary" : "default"}
                            className="whitespace-nowrap text-sm"
                        >
                            <Radio className="w-3 h-3 mr-1" />
                            <span className="mt-1">
                                {isLive ? "View Stream" : isPast ? "Stream Ended" : "Start Stream"}
                            </span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Stream?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this scheduled stream? This action cannot be undone and your subscribers will be notified.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>
                            <span className="mt-1">Keep Stream</span>
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmCancel}
                            disabled={isCancelling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            <span className="mt-1">{isCancelling ? "Cancelling..." : "Yes, Cancel Stream"}</span>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
