"use client";

import { Video, Users } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";

interface RoleSelectionDialogProps {
    open: boolean;
    onRoleSelect: (role: 'CREATOR' | 'MEMBER') => void;
}

export function RoleSelectionDialog({ open, onRoleSelect }: RoleSelectionDialogProps) {
    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Welcome to Buck! 🎉
                    </DialogTitle>
                    <DialogDescription className="text-center text-base pt-2">
                        Before we create your account, let us know how you'd like to use Buck
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-6">
                      {/* Member Option */}
                    <button
                        onClick={() => onRoleSelect('MEMBER')}
                        className="group relative overflow-hidden rounded-xl border-2 border-border bg-background p-6 text-left transition-all hover:border-primary/50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="flex items-start gap-4">
                            <div className="rounded-full bg-muted p-3 group-hover:bg-primary/10 transition-colors">
                                <Users className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1">
                                <h3 className="dark:text-white text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                                    No, I just want to watch
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Discover and enjoy amazing live content from creators around the world.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                        Watch Streams
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                        Support Creators
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                        Join Communities
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Creator Option */}
                    <button
                        onClick={() => onRoleSelect('CREATOR')}
                        className="group relative overflow-hidden rounded-xl border-2 border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="flex items-start gap-4">
                            <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                                <Video className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="dark:text-white text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                                    Yes, I want to host livestreams also
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Create and share live content with your audience. Perfect for streamers, educators, and content creators.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                        Go Live
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                        Earn Revenue
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                        Build Community
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="text-center text-sm text-muted-foreground font-semibold">
                    Don't worry, you can always upgrade to a creator account later!
                </div>
            </DialogContent>
        </Dialog>
    );
}
