import React from 'react';
import Image from "next/image";
import Link from "next/link";

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <div className="mb-10">
                    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                        <Image
                            src="/buck.svg"
                            alt="Buck Logo"
                            width={120}
                            height={36}
                            className="dark:hidden h-9 w-auto"
                            priority
                        />
                        <Image
                            src="/buck-dark.svg"
                            alt="Buck Logo"
                            width={120}
                            height={36}
                            className="hidden dark:block h-9 w-auto"
                            priority
                        />
                    </Link>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-2">Help Center</h1>
                <p className="text-muted-foreground mb-8 text-lg">How can we help you today?</p>

                <div className="grid md:grid-cols-2 gap-6">
                    <section className="bg-card hover:bg-accent/5 transition-colors p-6 rounded-xl border border-border shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            New to Buck? Learn the basics of setting up your profile, finding your favorite creators, and joining your first live class.
                        </p>
                    </section>

                    <section className="bg-card hover:bg-accent/5 transition-colors p-6 rounded-xl border border-border shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Account & Billing</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Manage your subscription details, payment methods, transaction history, and account security settings.
                        </p>
                    </section>

                    <section className="bg-card hover:bg-accent/5 transition-colors p-6 rounded-xl border border-border shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">For Creators</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Everything you need to know about streaming, monetization, viewer engagement, and growing your fitness community.
                        </p>
                    </section>

                    <section className="bg-card hover:bg-accent/5 transition-colors p-6 rounded-xl border border-border shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" /><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" /></svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Community & Safety</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Guidelines for our community standards, reporting procedures, and keeping Buck a safe space for everyone.
                        </p>
                    </section>
                </div>

                <div className="mt-12 p-8 bg-muted/30 rounded-2xl text-center border border-border/50">
                    <h3 className="text-2xl font-bold mb-3">Still need help?</h3>
                    <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                        Our support team is available to assist you with any questions or issues you might have.
                    </p>
                    <a
                        href="mailto:support@buckfitness.com"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
