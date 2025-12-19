"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, Eye, AlertTriangle } from "lucide-react";

interface RecordingConsentDialogProps {
    open: boolean;
    onConsent: (participateWithVideo: boolean) => void;
    creatorName: string;
    streamTitle: string;
}

export default function RecordingConsentDialog({
    open,
    onConsent,
    creatorName,
    streamTitle,
}: RecordingConsentDialogProps) {
    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader className="text-center sm:text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-primary" />
                    </div>
                    <DialogTitle className="text-xl">Recording Consent Required</DialogTitle>
                    <DialogDescription className="text-base">
                        You&apos;re about to join <strong className="text-foreground">{creatorName}</strong>&apos;s live stream
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                        <h4 className="font-semibold text-foreground mb-2">{streamTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                            This live stream <strong>will be recorded</strong> and may be shared as a replay for other viewers to watch later.
                        </p>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        By joining, you acknowledge that:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>The stream will be recorded</li>
                            <li>Your video/audio may appear in the recording (if you participate)</li>
                            <li>The recording may be shared publicly</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => onConsent(true)}
                        className="w-full h-12 text-base gap-2"
                    >
                        <Video className="w-5 h-5" />
                        Join & Participate
                        <span className="text-xs opacity-75">(Camera & Mic)</span>
                    </Button>

                    <Button
                        onClick={() => onConsent(false)}
                        variant="outline"
                        className="w-full h-12 text-base gap-2"
                    >
                        <Eye className="w-5 h-5" />
                        Watch Only
                        <span className="text-xs opacity-75">(View-only mode)</span>
                    </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-2">
                    You can change your participation mode during the stream
                </p>
            </DialogContent>
        </Dialog>
    );
}
