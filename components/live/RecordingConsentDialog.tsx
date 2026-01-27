"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, X, AlertTriangle } from "lucide-react";

interface RecordingConsentDialogProps {
    open: boolean;
    onConsent: (participateWithVideo: boolean) => void;
    creatorName: string;
    streamTitle: string;
    isJoining?: boolean;
}

export default function RecordingConsentDialog({
    open,
    onConsent,
    creatorName,
    streamTitle,
    isJoining = false,
}: RecordingConsentDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(val) => !val && !isJoining && onConsent(false)}>
            <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader className="text-center sm:text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-primary" />
                    </div>
                    <DialogTitle className="text-xl">Participate with Camera & Mic?</DialogTitle>
                    <DialogDescription className="text-base">
                        You&apos;re about to join <strong className="text-foreground">{creatorName}</strong>&apos;s live stream with your camera and microphone
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-muted/50 p-4 border border-border">
                        <h4 className="font-semibold text-foreground mb-2">{streamTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                            This live stream <strong>will be recorded</strong> and may be shared as a replay for other viewers to watch later.
                        </p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        By joining with camera & mic, you acknowledge that:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>The stream will be recorded</li>
                            <li>Your video/audio <strong>will appear</strong> in the recording</li>
                            <li>The recording may be shared publicly</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => onConsent(true)}
                        disabled={isJoining}
                        className="w-full h-12 text-base gap-2"
                    >
                        {isJoining ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Video className="w-5 h-5" />
                        )}
                        <p className="mt-1">{isJoining ? "Joining..." : "Join with Camera & Mic"}</p>
                    </Button>

                    <Button
                        onClick={() => onConsent(false)}
                        variant="outline"
                        disabled={isJoining}
                        className="w-full h-12 text-base gap-2"
                    >
                        <X className="w-5 h-5" />
                        <p className="mt-1">Cancel</p>
                        <span className="text-xs opacity-75 mt-1">(Continue watching)</span>
                    </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-2">
                    You can turn your camera and mic on/off during the stream
                </p>
            </DialogContent>
        </Dialog>
    );
}
