"use client";

import { Video } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";

interface UpgradeToCreatorDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function UpgradeToCreatorDialog({
    open,
    onConfirm,
    onCancel,
    isLoading = false
}: UpgradeToCreatorDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                        <Video className="h-6 w-6 text-primary" />
                        <p className="mt-1.5">Upgrade to Creator</p>
                    </DialogTitle>
                    <DialogDescription className="text-center text-base pt-2">
                        Are you ready to start your creator journey?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-3">
                            As a Creator, you'll be able to:
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">✓</span>
                                <span>Host live streams and connect with your audience in real-time</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">✓</span>
                                <span>Earn revenue from your content and subscriptions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">✓</span>
                                <span>Build and manage your own community</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">✓</span>
                                <span>Access advanced analytics and insights</span>
                            </li>
                        </ul>
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                        You can always switch back to a member account if you change your mind.
                    </p>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? "Upgrading..." : "Yes, Upgrade to Creator"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
