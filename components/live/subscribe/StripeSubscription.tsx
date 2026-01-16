"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { memberService } from "@/services/member";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface StripeSubscriptionProps {
    creatorId: string;
    onCancel?: () => void;
    onAllowNavigation?: () => void;
}

export function StripeSubscription({ creatorId, onCancel, onAllowNavigation }: StripeSubscriptionProps) {
    const { data: session } = useSession();

    useEffect(() => {
        const initiateCheckout = async () => {
            if (!session?.user?.id) {
                toast.error("Please log in");
                onCancel?.();
                return;
            }
            try {
                const result = await memberService.subscribeToCreator({
                    creatorId,
                    memberId: session.user.id
                });
                if (result.checkoutUrl) {
                    onAllowNavigation?.();
                    window.location.href = result.checkoutUrl;
                } else {
                    throw new Error("No checkout URL returned");
                }
            } catch (e: any) {
                console.error(e);
                toast.error(e.message || "Failed to start checkout");
                onCancel?.();
            }
        };

        if (session) {
            initiateCheckout();
        }
    }, [creatorId, session, onCancel]);

    return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-muted/10 rounded-none">
            <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                <h3 className="text-lg font-semibold dark:text-white">Preparing Checkout...</h3>
                <p className="text-muted-foreground text-sm">Redirecting to Stripe secure payment page.</p>
                <Button variant="outline" onClick={onCancel} className="mt-4">
                    Cancel
                </Button>
            </div>
        </div>
    );
}
