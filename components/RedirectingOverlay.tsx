"use client";

import Loader from "./Loader";

interface RedirectingOverlayProps {
    message?: string;
}

export default function RedirectingOverlay({
    message = "Redirecting to Creator Dashboard..."
}: RedirectingOverlayProps) {
    return (
        <div className="fixed inset-0 z-9999 h-screen bg-background/90 backdrop-blur-md flex items-center justify-center">
            <div className="text-center space-y-6 px-4">
                {/* Loader */}
                <div className="flex justify-center">
                    <Loader />
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">
                        🎉 Welcome to Creator Mode!
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        {message}
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="w-64 mx-auto">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full animate-progress-bar" />
                    </div>
                </div>
            </div>
        </div>
    );
}
