"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { creatorService } from "@/services/creator";
import { toast } from "sonner";

export default function StripeRefreshPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);

    // Check account status and redirect if already complete
    useEffect(() => {
        const checkStatusAndRedirect = async () => {
            if (!session?.user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                // Check current Stripe status
                const statusResponse = await creatorService.getStripeAccountStatus(session.user.id);

                if (statusResponse.success) {
                    // If onboarding is complete, redirect to profile
                    if (statusResponse.onboardingCompleted) {
                        toast.success("Your Stripe account is already verified!");
                        router.push("/creator/profile");
                        return;
                    }

                    // If fully connected (charges + payouts), redirect to success page
                    if (statusResponse.chargesEnabled && statusResponse.payoutsEnabled) {
                        router.push("/creator/stripe/success");
                        return;
                    }
                }
            } catch (error) {
                console.error("Failed to check account status:", error);
            }

            // Show the refresh page after 2 seconds
            setTimeout(() => {
                setIsLoading(false);
            }, 2000);
        };

        checkStatusAndRedirect();
    }, [session?.user?.id, router]);

    const handleRetry = async () => {
        if (!session?.user?.id) {
            toast.error("Please sign in to continue");
            return;
        }

        setIsRetrying(true);
        try {
            const response = await creatorService.createStripeAccountLink(session.user.id);
            if (response.success && response.url) {
                window.location.href = response.url;
            } else {
                toast.error("Failed to create Stripe connection link");
                setIsRetrying(false);
            }
        } catch (error: any) {
            console.error('Failed to retry Stripe connection:', error);
            toast.error(error.message || "Failed to retry Stripe connection");
            setIsRetrying(false);
        }
    };

    const handleGoBack = () => {
        router.push("/creator/profile");
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
            <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 space-y-6">
                {/* Warning Icon */}
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Additional Verification Required</h2>
                    <p className="text-muted-foreground">
                        Stripe needs a bit more information to complete your account setup. This is a standard security measure to protect your account.
                    </p>
                </div>

                {/* Info Box */}
                <div className="bg-muted/50 border border-border rounded-lg p-4 text-left">
                    <h3 className="text-sm font-semibold text-foreground mb-2">What you might need:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Proof of address (utility bill, bank statement, etc.)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Additional identity verification documents</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Business or tax information</span>
                        </li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                        💡 This process usually takes just a few minutes. Once verified, you'll be able to receive tips and subscriptions!
                    </p>
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
                                Continue Verification
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleGoBack}
                        variant="outline"
                        className="w-full"
                        size="lg"
                    >
                        Go Back to Profile
                    </Button>
                </div>
            </div>
        </div>
    );
}
