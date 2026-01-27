"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
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

interface LoginRequiredDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    description?: string;
}

export function LoginRequiredDialog({ open, onOpenChange, description = "Create an account or log in to join the stream with video and audio!" }: LoginRequiredDialogProps) {
    const router = useRouter();

    const handleLoginRedirect = () => {
        const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
        const callbackUrl = encodeURIComponent(currentUrl);
        router.push(`/login?callbackUrl=${callbackUrl}`);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Image
                            src="/buck.svg"
                            alt="Buck"
                            width={60}
                            height={18}
                            className="object-contain w-10 h-10"
                        />
                        Join Buck Today
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-400">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                    <AlertDialogCancel className="bg-transparent border-neutral-700 hover:bg-neutral-800 hover:text-white text-neutral-300 mt-0">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleLoginRedirect}
                        className="bg-primary hover:bg-primary/90 text-white"
                    >
                        Log in / Sign up
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
