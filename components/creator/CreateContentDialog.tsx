"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, Calendar, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import cuid from "cuid";

export function CreateContentDialog({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const handleGoLiveNow = () => {
        setOpen(false);
        // Generate local stream ID and go directly to live preview
        const streamId = cuid();
        router.push(`/creator/live`);
    };

    const handleSchedule = () => {
        setOpen(false);
        router.push("/creator/schedule?schedule=true");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border border text-card-foreground">
                <DialogHeader>
                    <DialogTitle className="text-xl text-center">Create New Content</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <Button
                        variant="outline"
                        className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-accent/50 border-input transition-all"
                        onClick={handleGoLiveNow}
                    >
                        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500">
                            <Radio className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-lg">Go Live</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-accent/50 border-input transition-all"
                        onClick={handleSchedule}
                    >
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-500">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-lg">Schedule</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
