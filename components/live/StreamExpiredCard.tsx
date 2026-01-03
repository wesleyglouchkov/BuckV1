"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function StreamExpiredCard() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-destructive"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Stream Expired
                            </h2>
                            <p className="text-muted-foreground mb-1">
                                This stream has ended and is no longer available.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Please create a new stream to go live again.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 pt-4">
                            <Button
                                onClick={() => window.location.href = "/creator/schedule"}
                                className="w-full"
                            >
                                Create New Stream
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = "/creator/schedule"}
                                className="w-full"
                            >
                                Back to Schedule
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
