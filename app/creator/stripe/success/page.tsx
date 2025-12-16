"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { creatorService } from "@/services/creator";
import { toast } from "sonner";

export default function StripeSuccessPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(true);
    const [status, setStatus] = useState<{
        connected: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        detailsSubmitted: boolean;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyStripeConnection = async () => {
            if (!session?.user?.id) {
                // Only stop loading if there's no session after a delay
                setTimeout(() => setIsVerifying(false), 1000);
                return;
            }

            try {
                // Wait for Stripe webhook to process (3 seconds)
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Check the Stripe account status
                const statusResponse = await creatorService.getStripeAccountStatus(session.user.id);

                if (statusResponse.success) {
                    const accountStatus = {
                        connected: statusResponse.connected || false,
                        chargesEnabled: statusResponse.chargesEnabled || false,
                        payoutsEnabled: statusResponse.payoutsEnabled || false,
                        detailsSubmitted: statusResponse.detailsSubmitted || false,
                    };

                    // If nothing is enabled, redirect to refresh page
                    if (!accountStatus.connected && !accountStatus.chargesEnabled && !accountStatus.detailsSubmitted) {
                        router.push('/creator/stripe/refresh');
                        return;
                    }

                    setStatus(accountStatus);

                    // Show success toast if fully connected
                    if (statusResponse.chargesEnabled) {
                        toast.success("Stripe account connected successfully!");
                    }
                } else {
                    setError("Failed to verify Stripe connection");
                }
            } catch (err: any) {
                console.error("Failed to verify Stripe connection:", err);
                setError(err.message || "Failed to verify Stripe connection");
            } finally {
                // Only stop loading after we get a response (success or error)
                setIsVerifying(false);
            }
        };

        verifyStripeConnection();
    }, [session?.user?.id, router]);

    const handleContinue = () => {
        router.push("/creator/profile");
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
                    <h2 className="text-2xl font-bold text-foreground">Verifying your Stripe connection...</h2>
                    <p className="text-muted-foreground">Please wait while we confirm your setup</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">Verification Failed</h2>
                        <p className="text-muted-foreground">
                            {error}
                        </p>
                    </div>
                    <Button onClick={handleContinue} className="w-full">
                        Return to Profile
                    </Button>
                </div>
            </div>
        );
    }

    // This should not happen due to redirect logic, but TypeScript needs the check
    if (!status) {
        return null;
    }

    const isFullyConnected = status.chargesEnabled && status.payoutsEnabled;
    const canAcceptPayments = status.chargesEnabled;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-2xl w-full bg-card border border-border rounded-lg p-8 space-y-6">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        {isFullyConnected ? "You're All Set!" : "Almost There!"}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {isFullyConnected
                            ? "Your Stripe account is fully connected and ready to go"
                            : "Your Stripe account is connected"}
                    </p>
                </div>

                {/* Status Cards */}
                <div className="space-y-3">
                    {/* Charges Enabled */}
                    <div className={`flex items-center gap-3 p-4 rounded-lg border ${status.chargesEnabled
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        }`}>
                        <CheckCircle className={`w-5 h-5 ${status.chargesEnabled ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                            }`} />
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${status.chargesEnabled
                                ? 'text-green-900 dark:text-green-100'
                                : 'text-amber-900 dark:text-amber-100'
                                }`}>
                                Accept Payments
                            </p>
                            <p className={`text-xs ${status.chargesEnabled
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-amber-700 dark:text-amber-300'
                                }`}>
                                {status.chargesEnabled
                                    ? "You can now receive tips and subscriptions"
                                    : "Complete setup to accept payments"}
                            </p>
                        </div>
                    </div>

                    {/* Payouts Enabled */}
                    <div className={`flex items-center gap-3 p-4 rounded-lg border ${status.payoutsEnabled
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        }`}>
                        <CheckCircle className={`w-5 h-5 ${status.payoutsEnabled ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                            }`} />
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${status.payoutsEnabled
                                ? 'text-green-900 dark:text-green-100'
                                : 'text-amber-900 dark:text-amber-100'
                                }`}>
                                Withdraw Funds
                            </p>
                            <p className={`text-xs ${status.payoutsEnabled
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-amber-700 dark:text-amber-300'
                                }`}>
                                {status.payoutsEnabled
                                    ? "You can withdraw earnings to your bank account"
                                    : "Payouts are being verified by Stripe. This may take 1-2 business days."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                {canAcceptPayments && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-2">What's Next?</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Start receiving tips from your viewers during livestreams</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Enable subscriptions for exclusive content</span>
                            </li>
                            {!status.payoutsEnabled && (
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>Wait for Stripe to verify your account (usually 1-2 business days) to enable withdrawals</span>
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Action Button */}
                <Button onClick={handleContinue} className="w-full" size="lg">
                    Continue to Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
