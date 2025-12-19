"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Radio, Video } from "lucide-react";
import StreamCalendar, { StreamEvent } from "@/components/schedule/StreamCalendar";
import ScheduleStreamDialog, { ScheduleStreamData } from "@/components/schedule/ScheduleStreamDialog";
import StreamDetailsDialog from "@/components/schedule/StreamDetailsDialog";
import { creatorService } from "@/services/creator";
import cuid from "cuid";

export default function CreatorSchedulePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [events, setEvents] = useState<StreamEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedStream, setSelectedStream] = useState<StreamEvent | null>(null);
    const [upcomingStream, setUpcomingStream] = useState<StreamEvent | null>(null);

    // Check for query param to auto-open schedule dialog
    useEffect(() => {
        if (searchParams.get("schedule") === "true") {
            setShowScheduleDialog(true);
            // Remove the query param from URL without reload
            router.replace("/creator/schedule", { scroll: false });
        }
    }, [searchParams, router]);

    // Fetch scheduled streams
    useEffect(() => {
        const fetchScheduledStreams = async () => {
            if (!session?.user?.id) return;

            try {
                const response = await creatorService.getScheduledStreamsOfTheCreator(session.user.id);

                if (response.success) {
                    const formattedEvents: StreamEvent[] = response.streams.map((stream: {
                        id: string;
                        title: string;
                        startTime: string;
                        endTime?: string;
                        workoutType?: string;
                        thumbnail?: string;
                        isLive?: boolean;
                        replayUrl?: string;
                    }) => ({
                        id: stream.id,
                        title: stream.title,
                        start: new Date(stream.startTime),
                        end: stream.endTime
                            ? new Date(stream.endTime)
                            : new Date(new Date(stream.startTime).getTime() + 60 * 60 * 1000), // Default 1 hour
                        resource: {
                            workoutType: stream.workoutType,
                            thumbnail: stream.thumbnail,
                            isLive: stream.isLive,
                            replayUrl: stream.replayUrl,
                        },
                    }));

                    setEvents(formattedEvents);

                    // Find the next upcoming stream
                    const now = new Date();
                    const upcoming = formattedEvents
                        .filter((e) => e.start > now && !e.resource?.isLive)
                        .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
                    setUpcomingStream(upcoming || null);
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Failed to load schedule";
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        };

        if (status === "authenticated") {
            fetchScheduledStreams();
        }
    }, [session, status]);

    // Handle scheduling/create a new stream
    const handleScheduleStream = async (data: ScheduleStreamData) => {
        if (!session?.user?.id) return;

        try {
            const response = await creatorService.createStream({
                ...data,
                creatorId: session.user.id,
                isScheduled: true,
            });

            if (response.success) {
                // Add to events
                const newEvent: StreamEvent = {
                    id: response.stream.id,
                    title: data.title,
                    start: new Date(data.startTime),
                    end: new Date(new Date(data.startTime).getTime() + 60 * 60 * 1000),
                    resource: {
                        workoutType: data.workoutType,
                        isLive: false,
                    },
                };

                setEvents((prev) => [...prev, newEvent]);
                toast.success("Stream scheduled! Your subscribers have been notified.");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to schedule stream";
            toast.error(message);
            throw error;
        }
    };

    // Handle going live now - just navigate to preview, no backend call yet
    const handleGoLiveNow = () => {
        if (!session?.user?.id) return;

        // Generate local stream ID - backend will be called when actually going live
        const streamId = cuid();
        router.push(`/creator/live/${streamId}`);
    };

    // Handle clicking a scheduled stream - show details dialog
    const handleSelectEvent = (event: StreamEvent) => {
        setSelectedStream(event);
        setShowDetailsDialog(true);
    };

    // Handle starting a stream
    const handleStartStream = (stream: StreamEvent) => {
        router.push(`/creator/live/${stream.id}`);
    };

    // Handle deleting a stream
    const handleDeleteStream = async (stream: StreamEvent) => {
        try {
            // Call API to delete the stream
            await creatorService.deleteStream(stream.id);

            // Remove from events
            setEvents((prev) => prev.filter((e) => e.id !== stream.id));

            // Update upcoming stream if needed
            if (upcomingStream?.id === stream.id) {
                const now = new Date();
                const newUpcoming = events
                    .filter((e) => e.id !== stream.id && e.start > now && !e.resource?.isLive)
                    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
                setUpcomingStream(newUpcoming || null);
            }

            toast.success("Stream cancelled successfully");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to cancel stream";
            toast.error(message);
            throw error;
        }
    };

    // Handle rescheduling/editing a stream
    const handleReschedule = (stream: StreamEvent) => {
        setSelectedStream(stream);
        setShowDetailsDialog(false);
        setShowScheduleDialog(true);
    };

    // Handle updating a stream
    const handleUpdateStream = async (streamId: string, data: ScheduleStreamData) => {
        try {
            await creatorService.updateStream(streamId, {
                title: data.title,
                workoutType: data.workoutType,
                startTime: data.startTime,
                timezone: data.timezone,
            });

            // Update the event in local state
            setEvents((prev) =>
                prev.map((e) =>
                    e.id === streamId
                        ? {
                            ...e,
                            title: data.title,
                            start: new Date(data.startTime),
                            end: new Date(new Date(data.startTime).getTime() + 60 * 60 * 1000),
                            resource: {
                                ...e.resource,
                                workoutType: data.workoutType,
                            },
                        }
                        : e
                )
            );

            // Clear editing state
            setSelectedStream(null);
            toast.success("Stream updated successfully!");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to update stream";
            toast.error(message);
            throw error;
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-muted rounded" />
                    <div className="h-4 w-64 bg-muted rounded" />
                    <div className="h-[600px] bg-muted rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Schedule</h1>
                    <p className="text-muted-foreground mt-2">
                        Plan and manage your live streams
                    </p>
                </div>

                <div className="flex gap-2 md:gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowScheduleDialog(true)}
                        className="md:px-4 md:py-2"
                    >
                        <Calendar className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline mt-1">Schedule Stream</span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleGoLiveNow}
                        className="md:px-4 md:py-2"
                    >
                        <Radio className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline mt-1">Go Live Now</span>
                    </Button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {upcomingStream && (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                <p className="mt-1">Next Scheduled Stream</p>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-foreground mb-1">
                                {upcomingStream.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                {upcomingStream.start.toLocaleDateString([], {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                })}{" "}
                                at{" "}
                                {upcomingStream.start.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })}
                            </p>
                            <Button
                                size="sm"
                                onClick={() => handleSelectEvent(upcomingStream)}
                            >
                                <Radio className="w-4 h-4 mr-2" />
                                <p className="mt-1">View Details</p>
                            </Button>
                        </CardContent>
                    </Card>
                )}

            </div>

            {/* Calendar */}
            <StreamCalendar events={events} onSelectEvent={handleSelectEvent} />

            {/* Add/Edit Schedule Dialog */}
            <ScheduleStreamDialog
                open={showScheduleDialog}
                onOpenChange={(open) => {
                    setShowScheduleDialog(open);
                    if (!open) setSelectedStream(null); // Clear selection when closing
                }}
                onSchedule={handleScheduleStream}
                onUpdate={handleUpdateStream}
                initialData={selectedStream ? {
                    id: selectedStream.id,
                    title: selectedStream.title,
                    workoutType: selectedStream.resource?.workoutType,
                    startTime: selectedStream.start,
                } : null}
            />

            {/* Onclicking Event: Stream Details Dialog */}
            <StreamDetailsDialog
                open={showDetailsDialog}
                onOpenChange={setShowDetailsDialog}
                stream={selectedStream}
                onStartStream={handleStartStream}
                onCancelStream={handleDeleteStream}
                onReschedule={handleReschedule}
            />
        </div>
    );
}
