"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { creatorService } from "@/services/creator";
import { toast } from "sonner";
import { useState } from "react";

export default function StripeRefreshPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isRetrying, setIsRetrying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Show loader for 2 seconds before showing the retry page
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleRetry = async () => {
        if (!session?.user?.id) return;

        setIsRetrying(true);
        try {
            const response = await creatorService.createStripeAccountLink(session.user.id);

            if (response.success && response.url) {
                window.location.href = response.url;
            } else {
                toast.error(response.message || "Failed to create Stripe link");
                setIsRetrying(false);
            }
        } catch (error: any) {
            console.error("Failed to create Stripe link:", error);
            toast.error(error.message || "Failed to create Stripe link");
            setIsRetrying(false);
        }
    };

    const handleGoBack = () => {
        window.location.href = "/creator/profile";
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
                    <h2 className="text-2xl font-bold text-foreground">Just a moment...</h2>
                    <p className="text-muted-foreground">Checking your setup status</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center space-y-6">
                {/* Warning Icon */}
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Setup Incomplete</h2>
                    <p className="text-muted-foreground">
                        It looks like you didn't complete the Stripe onboarding process. Don't worry, you can try again anytime!
                    </p>
                </div>

                {/* Info Box */}
                <div className="bg-muted/50 border border-border rounded-lg p-4 text-left">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Why complete setup?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Receive tips from viewers during livestreams</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Enable paid subscriptions for exclusive content</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Withdraw earnings directly to your bank account</span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="w-full"
                        size="lg"
                    >
                        {isRetrying ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleGoBack}
                        variant="outline"
                        className="w-full"
                    >
                        Maybe Later
                    </Button>
                </div>

                {/* Help Text */}
                <p className="text-xs text-muted-foreground">
                    Need help? Contact support or check our{" "}
                    <a href="/help" className="text-primary hover:underline">
                        help center
                    </a>
                </p>
            </div>
        </div>
    );
}
