
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface StripeSubscriptionProps {
    priceId?: string;
    onCancel?: () => void;
}

export function StripeSubscription({ priceId, onCancel }: StripeSubscriptionProps) {
    return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted bg-muted/10 animate-in fade-in zoom-in-95 duration-300 rounded-none">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/20 flex items-center justify-center mx-auto mb-4 rounded-none">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Stripe Secure Checkout</h3>
                <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                    This component will handle secure payments via Stripe.
                </p>
                {/* 
                   TODO: Implement Stripe Elements here.
                   This is a placeholder as requested.
                */}
                <div className="pt-4">
                    <Button variant="outline" onClick={onCancel} className="rounded-none">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}
