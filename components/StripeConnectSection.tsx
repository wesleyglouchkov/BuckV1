"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { DollarSign, Unlink, CheckCircle, AlertCircle } from "lucide-react";
import { creatorService } from "@/services";

interface StripeConnectSectionProps {
    isCreator: boolean;
}

export default function StripeConnectSection({ isCreator }: StripeConnectSectionProps) {
    const { data: session } = useSession();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [stripeConnected, setStripeConnected] = useState(false);
    const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);

    // Only show for creators
    if (!isCreator) {
        return null;
    }

    const handleConnectStripe = async () => {
        setIsConnecting(true);
        try {
            // Call API to create Stripe Connect account link
            const response = await creatorService.createStripeAccountLink(session?.user?.id || '');

            if (response.success && response.url) {
                // Redirect to Stripe Connect onboarding
                window.location.href = response.url;
            } else {
                toast.error(response.message || "Failed to connect Stripe account");
            }
        } catch (error: any) {
            console.error('Stripe connect error:', error);
            toast.error(error.response?.data?.message || "Failed to connect Stripe account");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnectStripe = async () => {
        if (!confirm("Are you sure you want to disconnect your Stripe account? You won't be able to receive tips until you reconnect.")) {
            return;
        }

        setIsDisconnecting(true);
        try {
            const response = await creatorService.disconnectStripeAccount(session?.user?.id || '');

            if (response.success) {
                setStripeConnected(false);
                setStripeAccountId(null);
                toast.success("Stripe account disconnected successfully");
            } else {
                toast.error(response.message || "Failed to disconnect Stripe account");
            }
        } catch (error: any) {
            console.error('Stripe disconnect error:', error);
            toast.error(error.response?.data?.message || "Failed to disconnect Stripe account");
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Stripe Connect
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Receive tips from your viewers
                    </p>
                </div>
            </div>

            {stripeConnected ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                Stripe Connected
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300">
                                You can now receive tips from viewers
                            </p>
                        </div>
                    </div>

                    {stripeAccountId && (
                        <div className="text-xs text-muted-foreground">
                            Account ID: {stripeAccountId}
                        </div>
                    )}

                    <Button
                        onClick={handleDisconnectStripe}
                        disabled={isDisconnecting}
                        variant="destructive"
                        size="sm"
                        className="w-full"
                    >
                        <Unlink className="w-4 h-4 mr-2" />
                        {isDisconnecting ? "Disconnecting..." : "Disconnect Stripe"}
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                Connect Stripe to Receive Tips
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                Connect your Stripe account to start receiving BUCK Coins (tips) from your viewers during livestreams.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                        <p>💰 1 BUCK Coin = $1 USD</p>
                        <p>🔒 Secure payments via Stripe Connect</p>
                        <p>📊 Track your earnings in real-time</p>
                    </div>

                    <Button
                        onClick={handleConnectStripe}
                        disabled={isConnecting}
                        className="w-full"
                    >
                        <DollarSign className="w-4 h-4 mr-2" />
                        {isConnecting ? "Connecting..." : "Connect Stripe Account"}
                    </Button>
                </div>
            )}
        </div>
    );
}
