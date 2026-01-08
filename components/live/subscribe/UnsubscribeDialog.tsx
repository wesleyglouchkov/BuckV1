"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AlertCircle, ShieldOff } from "lucide-react";

interface UnsubscribeDialogProps {
    creator: {
        id: string;
        name: string;
        avatar?: string;
    };
    onConfirm: () => void;
    children: React.ReactNode;
}

export function UnsubscribeDialog({ creator, onConfirm, children }: UnsubscribeDialogProps) {
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-card border-border shadow-2xl rounded-none">
                <DialogTitle className="hidden"></DialogTitle>
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header Banner */}
                    <div className="relative h-28 bg-linear-to-b from-destructive/10 to-card/5 p-6 flex flex-col items-center justify-center border-b border-border/50">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-destructive/20 blur-3xl rounded-full" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center">
                            <UserAvatar
                                src={creator.avatar}
                                name={creator.name}
                                className="w-14 h-14 border-4 border-card shadow-lg mb-2"
                            />
                            <DialogTitle className="text-lg font-bold flex items-center gap-1.5 text-foreground">
                                Unsubscribe from {creator.name}?
                            </DialogTitle>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Warning Message */}
                        <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-none space-y-3">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-destructive text-sm">You will lose access immediately</h4>
                                    <p className="text-sm text-foreground/80 leading-relaxed">
                                        By unsubscribing, you will lose access to:
                                    </p>
                                    <ul className="text-sm list-disc pl-4 text-muted-foreground space-y-1 pt-1">
                                        <li>Subscriber-only chat mode</li>
                                        <li>Exclusive subscriber-only streams</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-center text-muted-foreground">
                            You can always resubscribe later, but you'll lose your current streak.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleConfirm}
                                variant="destructive"
                                className="w-full h-11 text-base font-semibold rounded-none shadow-lg shadow-destructive/10"
                            >
                                <ShieldOff className="w-4 h-4 mr-2" />
                                Yes, Cancel Subscription
                            </Button>
                            <Button
                                onClick={() => setOpen(false)}
                                variant="outline"
                                className="w-full h-11 rounded-none border-border/50 hover:bg-muted"
                            >
                                No, Keep Benefits
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
