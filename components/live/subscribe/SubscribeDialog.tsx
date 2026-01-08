
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Check, Crown, Star, Sparkles, ShieldCheck } from "lucide-react";
import { StripeSubscription } from "./StripeSubscription";

interface SubscribeDialogProps {
    creator: {
        id: string;
        name: string;
        avatar?: string;
    };
    children: React.ReactNode;
}

export function SubscribeDialog({ creator, children }: SubscribeDialogProps) {
    const [step, setStep] = useState<"details" | "payment">("details");

    const benefits = [
        "Subscriber-only chat mode",
        "Access to subscriber-only streams"
    ];

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset step after a short delay to allow close animation to finish
            setTimeout(() => setStep("details"), 300);
        }
    };

    return (
        <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-card border-border shadow-2xl rounded-none">
                <DialogTitle className="hidden"></DialogTitle>
                {step === "details" ? (
                    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Header Banner */}
                        <div className="relative h-32 bg-linear-to-b from-primary/20 to-card/5 p-6 flex flex-col items-center justify-center border-b border-border/50">
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary blur-3xl rounded-full" />
                                <div className="absolute top-10 -left-10 w-24 h-24 bg-secondary blur-3xl rounded-full" />
                            </div>

                            <div className="relative z-10 flex flex-col items-center">
                                <UserAvatar
                                    src={creator.avatar}
                                    name={creator.name}
                                    className="w-16 h-16 border-4 border-card shadow-lg mb-2"
                                />
                                <DialogTitle className="text-lg font-bold flex items-center gap-1.5 text-foreground">
                                    Subscribe to {creator.name}
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                </DialogTitle>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Monthly Price */}
                            <div className="text-center space-y-1">
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-3xl font-bold text-foreground">$4.99</span>
                                    <span className="text-muted-foreground font-medium">/ month</span>
                                </div>
                                <p className="text-xs text-muted-foreground">Cancel anytime. Stripe Secure payment.</p>
                            </div>

                            {/* Benefits List */}
                            <div className="space-y-3 bg-muted/30 p-4 border border-border/50 rounded-none">
                                <div className="flex items-center gap-2 text-sm font-medium mb-2 text-primary">
                                    <Crown className="w-4 h-4" />
                                    <span>Subscriber Benefits</span>
                                </div>
                                {benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 min-w-4 min-h-4 bg-primary/10 flex items-center justify-center rounded-none">
                                            <Check className="w-2.5 h-2.5 text-primary" />
                                        </div>
                                        <span className="text-sm text-foreground/90">{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Button */}
                            <Button
                                onClick={() => setStep("payment")}
                                className="w-full h-12 text-base font-semibold bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-none"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Subscribe Now
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Minimal Header for Payment Step */}
                        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/10">
                            <h3 className="font-semibold flex items-center gap-2 text-foreground">
                                <Star className="w-4 h-4 text-primary" />
                                Review & Pay
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStep("details")}
                                className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-none"
                            >
                                Back
                            </Button>
                        </div>

                        <div className="p-0">
                            <StripeSubscription onCancel={() => setStep("details")} />
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
