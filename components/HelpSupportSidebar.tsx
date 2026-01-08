import React from 'react';
import Link from 'next/link';

export default function HelpSupportSidebar() {
    return (
        <div className="bg-card border border-border  p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">
                Help & Support
            </h2>
            <div className="space-y-2">
                <Link
                    href="/help"
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    Help Center
                </Link>
                <Link
                    href="/terms"
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    Terms of Service
                </Link>
                <Link
                    href="/privacy"
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    Privacy Policy
                </Link>
            </div>
        </div>
    );
}
