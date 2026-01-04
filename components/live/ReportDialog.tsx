"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { streamService } from "@/services/stream";

interface ReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportType: "message" | "stream";
    senderId: string;
    senderName: string;
    messageId?: string; // Required for message reports
    messageContent?: string; // Optional for message reports
    streamId: string;
    streamTitle?: string;
    currentUserId?: string;
}

export function ReportDialog({
    open,
    onOpenChange,
    reportType,
    senderId,
    senderName,
    messageId,
    messageContent,
    streamId,
    streamTitle,
    currentUserId,
}: ReportDialogProps) {
    const [reporterComment, setReporterComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        // Validation 1: User must be logged in
        if (!currentUserId) {
            toast.error("You must be logged in to report content");
            return;
        }

        // Validation 2: Cannot report own content
        if (senderId === currentUserId) {
            toast.error("You cannot report your own content");
            return;
        }

        // Validation 3: Comment must not be empty or whitespace only
        if (!reporterComment.trim()) {
            toast.error("Please provide a reason for reporting");
            return;
        }

        // Validation 4: Comment length (min 10, max 1000 characters)
        const trimmedComment = reporterComment.trim();
        if (trimmedComment.length < 10) {
            toast.error("Report comment must be at least 10 characters");
            return;
        }
        if (trimmedComment.length > 1000) {
            toast.error("Report comment must not exceed 1000 characters");
            return;
        }

        // Validation 5: Required IDs must not be empty
        if (!senderId || !streamId) {
            toast.error("Missing required information");
            return;
        }

        // Validation 6: Message reports must have messageId
        if (reportType === "message" && !messageId) {
            toast.error("Message ID is missing");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await streamService.reportContent({
                senderId,
                reporterId: currentUserId,
                reporterComment: reporterComment.trim(),
                livestreamId: streamId,
                flaggedMsgId: reportType === "message" ? messageId : undefined,
            });

            if (response.success) {
                toast.success("Report submitted successfully. Our team will review it shortly.");
                setReporterComment("");
                onOpenChange(false);
            } else {
                toast.error(response.message || "Failed to submit report");
            }
        } catch (error: unknown) {
            console.error("Failed to submit report:", error);

            // Check if it's a network error
            const err = error as any;

            // Network failure detection
            if (!navigator.onLine) {
                toast.error("No internet connection. Please check your network and try again.");
            } else if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
                toast.error("Network error. Please check your connection and try again.");
            } else if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
                toast.error("Request timed out. Please try again.");
            } else if (err?.response?.status === 401) {
                toast.error("Session expired. Please log in again.");
            } else if (err?.response?.status === 403) {
                toast.error("You don't have permission to report this content.");
            } else if (err?.response?.status === 429) {
                toast.error("Too many reports. Please wait a moment before trying again.");
            } else if (err?.response?.status >= 500) {
                toast.error("Server error. Please try again later.");
            } else {
                // Generic error with message from backend if available
                toast.error(err?.response?.data?.message || err?.message || "Failed to submit report. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReporterComment("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md rounded-none">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Report {reportType === "message" ? "Message" : "Stream"}
                    </DialogTitle>
                    <DialogDescription>
                        Please provide details about why you're reporting this {reportType}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Display content being reported */}
                    <div className="p-3 border border-border bg-muted/30">
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                            {reportType === "message" ? "Message from" : "Stream by"} {senderName}
                        </h4>
                        {reportType === "message" && messageContent && (
                            <p className="text-sm text-foreground wrap-break-word">{messageContent}</p>
                        )}
                        {reportType === "stream" && streamTitle && (
                            <p className="text-sm text-foreground font-semibold">{streamTitle}</p>
                        )}
                    </div>

                    {/* Reporter comment */}
                    <div className="space-y-2">
                        <Label htmlFor="reportComment">Reason for reporting *</Label>
                        <Textarea
                            id="reportComment"
                            placeholder="Please describe the issue (e.g., inappropriate content, harassment, spam)..."
                            value={reporterComment}
                            onChange={(e) => setReporterComment(e.target.value)}
                            rows={4}
                            className="resize-none"
                            disabled={isSubmitting}
                        />
                        <div className="flex items-center justify-between text-xs">
                            <p className="text-muted-foreground">
                                Your report will be reviewed by our moderation team.
                            </p>
                            <p className={`font-medium ${reporterComment.trim().length < 10
                                    ? 'text-destructive'
                                    : reporterComment.trim().length > 1000
                                        ? 'text-destructive'
                                        : 'text-muted-foreground'
                                }`}>
                                {reporterComment.trim().length}/1000
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !reporterComment.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Report"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
