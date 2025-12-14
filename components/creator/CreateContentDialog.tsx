import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Video, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateContentDialog({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const contentOptions = [
        {
            title: "Go Live",
            icon: Video,
            path: "/live/create",
            colorClass: "bg-red-100 dark:bg-red-900/20 text-red-500"
        },
        {
            title: "Schedule a Live",
            icon: Calendar,
            path: "/live/schedule",
            colorClass: "bg-blue-100 dark:bg-blue-900/20 text-blue-500"
        }
    ];

    const handleNavigate = (path: string) => {
        setOpen(false);
        router.push(path);
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
                    {contentOptions.map((option, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-accent/50 border-input transition-all"
                            onClick={() => handleNavigate(option.path)}
                        >
                            <div className={`p-3 rounded-full ${option.colorClass}`}>
                                <option.icon className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-lg">{option.title}</span>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
