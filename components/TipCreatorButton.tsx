"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";
import { DollarSign, X } from "lucide-react";
import { memberService } from "@/services";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TipCreatorButtonProps {
    creatorId: string;
    creatorName: string;
    livestreamId?: string;
}

export default function TipCreatorButton({
    creatorId,
    creatorName,
    livestreamId
}: TipCreatorButtonProps) {
    const { data: session } = useSession();
    const [showTipDialog, setShowTipDialog] = useState(false);
    const [buckAmount, setBuckAmount] = useState<number>(5);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);

    const quickAmounts = [1, 5, 10, 25, 50, 100];

    const handleTipCreator = async () => {
        const amount = customAmount ? parseFloat(customAmount) : buckAmount;

        if (!amount || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (amount < 1) {
            toast.error("Minimum tip is 1 BUCK Coin ($1)");
            return;
        }

        if (amount > 10000) {
            toast.error("Maximum tip is 10,000 BUCK Coins ($10,000)");
            return;
        }

        setIsProcessing(true);
        try {
            // Create payment intent
            const response = await memberService.createTipPayment({
                creatorId,
                amount,
                livestreamId,
                memberId: session?.user?.id || '',
            });

            if (response.success && response.checkoutUrl) {
                // Redirect to Stripe Checkout
                window.location.href = response.checkoutUrl;
            } else {
                toast.error(response.message || "Failed to process tip");
            }
        } catch (error: any) {
            console.error('Tip error:', error);
            toast.error(error.response?.data?.message || "Failed to send tip");
        } finally {
            setIsProcessing(false);
        }
    };

    // Only show for logged-in members
    if (!session || session.user?.role?.toLowerCase() === 'creator') {
        return null;
    }

    return (
        <>
            <Button
                onClick={() => setShowTipDialog(true)}
                className="bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold shadow-lg"
            >
                <DollarSign className="w-4 h-4 mr-2" />
                Tip Creator 🪙
            </Button>

            <AlertDialog open={showTipDialog} onOpenChange={setShowTipDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-amber-500" />
                            Tip {creatorName}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Send BUCK Coins to show your support! 1 BUCK = $1 USD
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Quick Amount Buttons */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Quick Select
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {quickAmounts.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => {
                                            setBuckAmount(amount);
                                            setCustomAmount("");
                                        }}
                                        className={`px-4 py-2 rounded-md border transition-colors ${buckAmount === amount && !customAmount
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card border-border hover:bg-accent"
                                            }`}
                                    >
                                        {amount} 🪙
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Amount Input */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Or Enter Custom Amount
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    step="1"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Total Display */}
                        <div className="bg-muted/50 border border-border p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total</span>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-foreground">
                                        {customAmount || buckAmount} 🪙
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        ${(customAmount ? parseFloat(customAmount) : buckAmount).toFixed(2)} USD
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowTipDialog(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleTipCreator}
                            disabled={isProcessing}
                            className="bg-linear-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                        >
                            {isProcessing ? "Processing..." : `Send ${customAmount || buckAmount} BUCK 🪙`}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
