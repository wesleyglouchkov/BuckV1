"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { memberService } from "@/services/member";
import { toast } from "sonner";
import { DollarSign, Loader2, Heart, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { streamService } from "@/services/stream/index";
import { LoginRequiredDialog } from "./LoginRequiredDialog";
import { Theme, getTheme } from "@/lib/theme";
import { useEffect } from "react";
import { mutate } from "swr";
import { getRTMInstance } from "@/lib/agora/rtm-singleton";
import { SignalingMessage } from "@/lib/agora/agora-rtm";

// Initialize Stripe outside component to avoid recreation
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

if (!stripeKey) {
    console.error("Stripe Publishable Key is missing!");
}
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const PRESET_AMOUNTS = [5, 10, 20, 50];
const MAX_TIP_AMOUNT = 500; // Maximum tip amount in dollars
const MIN_TIP_AMOUNT = 5;   // Minimum tip amount in dollars

interface TipButtonProps {
    creatorId: string;
    livestreamId?: string;
    className?: string;
    variant?: "default" | "outline" | "secondary" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
    children?: React.ReactNode;
}

// Sub-component for the payment form to use Stripe hooks
function PaymentForm({ amount, onSuccess, onCancel }: { amount: number, onSuccess: () => void, onCancel: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href, // This handles the redirect case if needed, but we aim for handling it inline if possible or via webhook
            },
            redirect: "if_required",
        });

        if (error) {
            setErrorMessage(error.message || "Payment failed");
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
            <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isProcessing}>
                    Back
                </Button>
                <Button type="submit" disabled={!stripe || isProcessing} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay $${amount}`}
                </Button>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Payments are secured by Stripe</span>
            </div>
        </form>
    );
}

// Hook to detect theme changes
function useBuckTheme() {
    const [theme, setInternalTheme] = useState<Theme>("light");

    // Check initially and listen for class changes on html element
    useEffect(() => {
        // Initial check
        setInternalTheme(getTheme());

        // Create observer to watch for class changes on <html>
        // This is necessary because your manual theme toggle modifies the DOM directly
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "class"
                ) {
                    const isDark = document.documentElement.classList.contains("dark");
                    setInternalTheme(isDark ? "dark" : "light");
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    return { theme };
}

export function TipButton({
    creatorId,
    livestreamId,
    className,
    variant = "default",
    size = "default",
    children
}: TipButtonProps) {
    const { data: session } = useSession();
    const { theme } = useBuckTheme();
    const [amount, setAmount] = useState<string>("5");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentStep, setPaymentStep] = useState<'amount' | 'payment' | 'success'>('amount');
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    const resetState = () => {
        setAmount("5");
        setClientSecret(null);
        setPaymentStep('amount');
        setIsLoading(false);
        setShowLoginDialog(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Delay reset slightly to avoid UI jump during close animation
            setTimeout(resetState, 300);
        }
    };

    const initiatePayment = async () => {
        if (!session?.user?.id) {
            setShowLoginDialog(true);
            return;
        }

        const numAmount = Math.floor(parseFloat(amount)); // Force integer amounts
        if (isNaN(numAmount) || numAmount < MIN_TIP_AMOUNT) {
            toast.error(`Please enter a valid amount (min $${MIN_TIP_AMOUNT})`);
            return;
        }
        if (numAmount > MAX_TIP_AMOUNT) {
            toast.error(`Maximum tip amount is $${MAX_TIP_AMOUNT}`);
            return;
        }

        setIsLoading(true);
        try {
            const result = await memberService.createTipPayment({
                creatorId,
                memberId: session.user.id,
                amount: numAmount,
                livestreamId
            });

            if (result.clientSecret) {
                setClientSecret(result.clientSecret);
                setPaymentStep('payment');
            } else {
                throw new Error("Failed to initialize payment");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to initiate tip");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccess = async () => {
        setPaymentStep('success');

        // Send chat message and broadcast via RTM for real-time delivery
        if (livestreamId && session?.user?.name) {
            const message = `💰 Tipped $${amount}! 🚀`;
            const timestamp = Date.now();
            try {
                // 1. Broadcast via RTM for instant delivery to all participants (including host)
                const rtmManager = getRTMInstance();
                if (rtmManager && rtmManager.isConnected()) {
                    const rtmMessage: SignalingMessage = {
                        type: "CHAT_MESSAGE",
                        payload: {
                            userId: session.user.id || "anonymous",
                            username: session.user.name,
                            message: message,
                            timestamp,
                            isCreator: false, // Tippers are always viewers/members
                        },
                    };
                    await rtmManager.sendMessage(rtmMessage);
                    console.log("Tip message broadcast via RTM");
                }

                // 2. Persist to database for history
                await streamService.sendChatMessage(livestreamId, message);

                // Revalidate chat history so it shows up for the sender
                mutate(`/streams/${livestreamId}/chat`);
            } catch (e) {
                console.error("Failed to send tip message", e);
            }
        }

        setTimeout(() => {
            setIsOpen(false);
            // Reset state after dialog closes so it's fresh for next time
            setTimeout(resetState, 300);
        }, 2000);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {children || (
                        <Button variant={variant} size={size} className={cn("gap-2", className)}>
                            <DollarSign className="w-4 h-4" />
                            Tip
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-none !rounded-none !border-0">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {paymentStep === 'success' ? (
                                <div className="flex items-center gap-2 text-green-500">
                                    <DollarSign className="w-6 h-6 fill-current" />
                                    Tip Sent!
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                                    Send BUCKS (Tip)
                                </div>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {paymentStep === 'amount' && (
                            <div className="grid gap-4">
                                <div className="grid grid-cols-4 gap-2">
                                    {PRESET_AMOUNTS.map((amt) => (
                                        <Button
                                            key={amt}
                                            variant={parseFloat(amount) === amt ? "default" : "outline"}
                                            className={cn(
                                                "h-12 text-lg font-semibold transition-all hover:scale-105",
                                                parseFloat(amount) === amt ? "shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-80"
                                            )}
                                            onClick={() => setAmount(amt.toString())}
                                        >
                                            ${amt}
                                        </Button>
                                    ))}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="custom-amount">Custom Amount</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="custom-amount"
                                            type="number"
                                            min="1"
                                            step="1"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="pl-9 h-12 text-lg"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={initiatePayment}
                                    disabled={isLoading || !amount || parseFloat(amount) < 1}
                                    className="w-full h-12 mt-2 text-lg font-semibold bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Preparing...
                                        </>
                                    ) : (
                                        <>
                                            Next: Payment Details
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {paymentStep === 'payment' && clientSecret && (
                            <Elements stripe={stripePromise} options={{
                                clientSecret,
                                appearance: {
                                    theme: theme === 'dark' ? 'night' : 'stripe',
                                    labels: 'floating',
                                    variables: {
                                        colorPrimary: '#10b981', // green-500
                                        colorBackground: theme === 'dark' ? 'hsl(210 20% 12%)' : 'hsl(0 0% 100%)', // Matches --card from globals.css
                                        colorText: theme === 'dark' ? '#f4f4f5' : '#09090b', // zinc-100 or zinc-950
                                        colorDanger: '#ef4444', // red-500
                                        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                                        spacingUnit: '4px',
                                        borderRadius: '0px', // user rule: no rounded corners
                                        // Customizing specific inputs
                                        colorTextPlaceholder: theme === 'dark' ? '#71717a' : '#a1a1aa', // zinc-500/400
                                        focusBoxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)', // green ring
                                        focusOutline: 'none',
                                    }
                                }
                            }}>
                                <PaymentForm
                                    amount={parseFloat(amount)}
                                    onSuccess={handleSuccess}
                                    onCancel={() => setPaymentStep('amount')}
                                />
                            </Elements>
                        )}

                        {paymentStep === 'success' && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                                    <DollarSign className="w-10 h-10 text-green-500" />
                                </div>
                                <p className="text-center text-muted-foreground">
                                    Thank you for supporting the creator!
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
        </>
    );
}
