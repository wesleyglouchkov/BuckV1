"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { creatorService } from "@/services/creator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Video,
    Play,
    Copy,
    Radio,
    Trash2,
    X,
    Loader2,
    Calendar,
    Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
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
import Image from "next/image";
import { formatDateTime } from "@/utils/dateTimeUtils";
import { VideoSnapshot } from "@/lib/s3/video-thumbnail";
import { useSignedThumbnails } from "@/hooks/use-signed-thumbnails";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ModerationVideoPlayer from "@/components/admin/ModerationVideoPlayer";
import { getSignedStreamUrl, deleteS3File, deleteS3FolderAction } from "@/app/actions/s3-actions";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/constants/categories";
import { CreateContentDialog } from "@/components/creator/CreateContentDialog";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

const WORKOUT_TYPES = [
    "All Types",
    ...CATEGORIES.map((c) => c.name)
];

// Format duration from seconds to readable format
const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) return null;
    // Subtract 7 seconds to account for stream processing
    const adjustedSeconds = Math.max(0, Math.floor(seconds) - 7);
    const h = Math.floor(adjustedSeconds / 3600);
    const m = Math.floor((adjustedSeconds % 3600) / 60);
    const s = adjustedSeconds % 60;

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
};

// Calculate duration from startTime and endTime if duration field is not available
const calculateDuration = (stream: { duration?: number | null; startTime?: string | Date; endTime?: string | Date }) => {
    // If duration is already available, use it
    if (stream.duration && stream.duration > 0) {
        return formatDuration(stream.duration);
    }

    // Calculate from startTime and endTime
    if (stream.startTime && stream.endTime) {
        const start = new Date(stream.startTime).getTime();
        const end = new Date(stream.endTime).getTime();
        const durationMs = end - start;

        if (durationMs > 0) {
            const durationSeconds = Math.floor(durationMs / 1000);
            return formatDuration(durationSeconds);
        }
    }

    return null;
};

export default function MyStreamsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [workoutType, setWorkoutType] = useState("All Types");
    const [timeframe, setTimeframe] = useState("all");
    const [page, setPage] = useState(1);
    const limit = 10;

    // Automatically scroll to top when page changes
    useScrollToTop(page);

    // Handle debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to first page on search
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const [selectedReplay, setSelectedReplay] = useState<any>(null);
    const [signedReplayUrl, setSignedReplayUrl] = useState<string>("");
    const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
    const [streamIdToDelete, setStreamIdToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch streams with filters
    const { data: response, isLoading } = useSWR(
        ['my-streams', page, debouncedSearch, workoutType, timeframe],
        () => creatorService.getMyStreams({
            page,
            limit,
            search: debouncedSearch || undefined,
            type: workoutType === "All Types" ? undefined : workoutType,
            timeframe: timeframe === "all" ? undefined : timeframe
        })
    );

    const handleDeleteStream = async () => {
        if (!streamIdToDelete) return;

        setIsDeleting(true);
        try {
            // Find the stream to get IDs for folder path
            const streamToDelete = streams.find((s: any) => s.id === streamIdToDelete);

            // 1. Delete entire stream folder from S3 (via Server Action)
            // Pattern: creators/{creatorId}/streams/{streamId}
            if (streamToDelete) {
                const creatorId = streamToDelete.creatorId;
                const streamId = streamToDelete.id;

                if (creatorId && streamId) {
                    const folderPath = `creators/${creatorId}/streams/${streamId}`;
                    await deleteS3FolderAction(folderPath);
                } else if (streamToDelete.replayUrl || streamToDelete.streamUrl) {
                    // Fallback to single file deletion if folder path can't be constructed
                    await deleteS3File(streamToDelete.replayUrl || streamToDelete.streamUrl);
                }
            }

            // 2. Delete from Database (via Backend API)
            await creatorService.deleteMyStream(streamIdToDelete);

            toast.success("Stream and all associated assets deleted successfully");

            // Mutate the SWR key to refresh the list
            mutate(['my-streams', page, debouncedSearch, workoutType, timeframe]);
            setStreamIdToDelete(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete stream");
        } finally {
            setIsDeleting(false);
        }
    };

    const streams = response?.streams || [];
    const pagination = response?.pagination || { page: 1, totalPages: 1, total: 0 };

    // Batch sign thumbnails for streams missing images
    const signedThumbnails = useSignedThumbnails(streams);

    const handleReplayClick = async (stream: any) => {
        const replayUrl = stream.replayUrl || stream.streamUrl;
        if (!replayUrl) {
            toast.error("No replay available for this stream");
            return;
        }

        setSelectedReplay(stream);
        setIsGeneratingUrl(true);
        setSignedReplayUrl("");

        try {
            const url = await getSignedStreamUrl(replayUrl);
            setSignedReplayUrl(url || "");
        } catch (error) {
            toast.error("Failed to generate playback URL");
            console.error(error);
        } finally {
            setIsGeneratingUrl(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Streams</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage and review your recorded stream replays
                    </p>
                </div>
                <CreateContentDialog>
                    <div className="animated-border-btn" data-tour="get-live-btn">
                        <Button className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Get Live
                        </Button>
                    </div>
                </CreateContentDialog>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-10 h-11 rounded-none border-border/40 bg-card hover:bg-accent/5 transition-colors focus:ring-primary/50"
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select
                        value={timeframe}
                        onValueChange={(val) => {
                            setTimeframe(val);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="rounded-none border-border/40 bg-card focus:ring-primary/50 h-11 dark:text-white">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Timeframe" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                            <SelectItem value="all">All Streams</SelectItem>
                            <SelectItem value="upcoming">Upcoming & Live</SelectItem>
                            <SelectItem value="past">Past Replays</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-full md:w-48">
                    <Select
                        value={workoutType}
                        onValueChange={(val) => {
                            setWorkoutType(val);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="rounded-none border-border/40 bg-card focus:ring-primary/50 h-11 dark:text-white">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Workout Type" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                            {WORKOUT_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-card border border-border/20 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="border-border/20">
                            <TableHead className="w-[100px]">Recording</TableHead>
                            <TableHead>Stream Details</TableHead>
                            <TableHead className="hidden md:table-cell">Workout Type</TableHead>
                            <TableHead className="hidden sm:table-cell">Started At</TableHead>
                            <TableHead className="hidden lg:table-cell">Ended At</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell><div className="w-20 h-12 bg-muted" /></TableCell>
                                    <TableCell><div className="h-4 w-32 bg-muted mb-1" /><div className="h-3 w-20 bg-muted" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-muted" /></TableCell>
                                    <TableCell className="hidden sm:table-cell"><div className="h-4 w-24 bg-muted" /></TableCell>
                                    <TableCell className="hidden lg:table-cell"><div className="h-4 w-24 bg-muted" /></TableCell>
                                    <TableCell><div className="ml-auto h-8 w-16 bg-muted" /></TableCell>
                                </TableRow>
                            ))
                        ) : streams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    <Video className="w-10 h-10 opacity-20 mx-auto mb-2" />
                                    No streams found for the current filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            streams.map((stream: any) => {
                                const hasReplay = !!(stream.replayUrl || stream.streamUrl);
                                return (
                                    <TableRow key={stream.id} className="border-border/10 hover:bg-accent/30 transition-colors group">
                                        <TableCell>
                                            <div
                                                className={`w-20 h-12 bg-muted relative overflow-hidden ${hasReplay ? 'cursor-pointer group/thumb' : 'cursor-default grayscale opacity-50'}`}
                                                onClick={() => hasReplay && handleReplayClick(stream)}
                                            >
                                                {stream.thumbnail ? (
                                                    <Image
                                                        src={stream.thumbnail}
                                                        alt={stream.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : hasReplay && signedThumbnails[stream.id] ? (
                                                    <VideoSnapshot
                                                        src={signedThumbnails[stream.id]}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Video className="w-5 h-5 text-muted-foreground/50" />
                                                    </div>
                                                )}
                                                {hasReplay && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                                        <Play className="w-6 h-6 text-white fill-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-foreground truncate max-w-[150px] lg:max-w-xs">{stream.title}</div>
                                            {calculateDuration(stream) && (
                                                <div className="text-xs text-muted-foreground mt-0.5">{calculateDuration(stream)}</div>
                                            )}
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {stream.isLive ? (
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 border border-red-500/20 flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /> Live Now
                                                    </span>
                                                ) : stream.isScheduled && (
                                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 border border-border/20">Scheduled</span>
                                                )}
                                                {new Date(stream.startTime) > new Date() && !stream.isLive && (
                                                    <span className="text-[10px] uppercase tracking-wider text-blue-500 bg-blue-500/10 px-1.5 py-0.5 border border-blue-500/20">Upcoming</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {stream.workoutType && (
                                                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                                                    {stream.workoutType}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                            {formatDateTime(stream.startTime)}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                            {stream.endTime ? formatDateTime(stream.endTime) : <span className="text-[10px] opacity-50">N/A</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {stream.isLive ? (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="rounded-none bg-red-600 text-white hover:bg-red-700 transition-all"
                                                        onClick={() => router.push(`/creator/live/${stream.id}`)}
                                                    >
                                                        <Radio className="w-3 h-3 mr-2" />
                                                        Join Live
                                                    </Button>
                                                ) : new Date(stream.startTime) > new Date() ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-none border-border/40 hover:bg-accent transition-all"
                                                        onClick={() => router.push(`/creator/live/${stream.id}`)}
                                                    >
                                                        <Video className="w-3 h-3 mr-2" />
                                                        Start Stream
                                                    </Button>
                                                ) : hasReplay ? (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                                                        onClick={() => handleReplayClick(stream)}
                                                    >
                                                        <Play className="w-3 h-3 mr-2" />
                                                        Replay
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic mr-4">No Replay</span>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-none border-border/40 hover:bg-red-500 hover:text-white transition-all p-1.5 h-8 w-8"
                                                    onClick={() => setStreamIdToDelete(stream.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                {!isLoading && pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-border/10 bg-muted/20 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> entries
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none disabled:opacity-30"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center dark:text-white px-4 text-sm font-medium">
                                Page {page} of {pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none disabled:opacity-30"
                                disabled={page >= pagination.totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Replay Modal - Shared Logic */}
            <Dialog open={!!selectedReplay} onOpenChange={(open) => !open && setSelectedReplay(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 shadow-2xl bg-background border border-border rounded-none">
                    {/* Header */}
                    <div className="p-6 pb-2 border-b border-border/20 flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {selectedReplay?.title || "Stream Replay"}
                            {selectedReplay?.workoutType && (
                                <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 border border-border/50">
                                    {selectedReplay.workoutType}
                                </span>
                            )}
                        </DialogTitle>
                        <button
                            onClick={() => setSelectedReplay(null)}
                            className="absolute right-4 top-4 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-1 hover:bg-muted"
                        >
                            <X className="h-4 w-4 dark:text-white cursor-pointer" />
                            <span className="sr-only">Close</span>
                        </button>
                    </div>

                    <div className="overflow-y-auto px-6 pb-6 flex-1">
                        <div className="w-full space-y-4">
                            {isGeneratingUrl ? (
                                <div className="w-full aspect-video flex flex-col items-center justify-center bg-black border-2 border-primary/30">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                                    <p className="text-primary text-sm font-medium">Generating secure link...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-hidden ring-1 ring-border/20 shadow-sm">
                                        <ModerationVideoPlayer
                                            src={signedReplayUrl}
                                            title={selectedReplay?.title}
                                            poster={selectedReplay?.thumbnail}
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-muted/40 border border-border/40">
                                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                            Secure Link (valid 2h):
                                        </p>
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <code className="select-none text-[10px] sm:text-xs text-muted-foreground truncate flex-1 font-mono px-2 py-1 bg-background/50 border border-border/30">
                                                {signedReplayUrl}
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(signedReplayUrl);
                                                    toast.success("Replay URL copied to clipboard");
                                                }}
                                                className="p-2 hover:bg-background transition-all shadow-sm border border-border/20 text-muted-foreground hover:text-foreground shrink-0"
                                                title="Copy to clipboard"
                                            >
                                                <Copy className="h-4 w-4 cursor-pointer" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Confirmation Dialog */}
            <AlertDialog open={!!streamIdToDelete} onOpenChange={(open) => !open && setStreamIdToDelete(null)}>
                <AlertDialogContent className="rounded-none border-border border-2">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the stream record and its associated video replay from our servers and S3 storage.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white rounded-none"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteStream();
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : "Yes, Delete Stream"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
