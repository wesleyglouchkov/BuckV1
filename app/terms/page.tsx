import React from 'react';
import Image from "next/image";
import Link from "next/link";

export default function TermsPage() {
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

                <div className="max-w-none">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
                    <p className="text-muted-foreground mb-8">Effective Date: February 18, 2026</p>

                    <p className="text-muted-foreground leading-7 mb-8">
                        Welcome to Buck ("Buck," "Platform," "we," "us," or "our").
                        By accessing or using Buck, you agree to these Terms of Service ("Terms"). If you do not agree, do not use the Platform.
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Platform Overview</h2>
                        <p className="text-muted-foreground leading-7">
                            Buck is a technology platform that enables creators to host live and recorded sessions and allows users to view, interact with, and subscribe to content.
                            Buck does not provide medical, fitness, legal, or professional advice and does not supervise or guarantee creator content.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
                        <p className="text-muted-foreground leading-7">
                            You must be at least 18 years old, or at least 13 years old with parental consent where permitted by law.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. Accounts</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            You are responsible for maintaining the confidentiality of your account credentials and all activity under your account.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            Buck is not liable for unauthorized access caused by your failure to secure your account.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Creators</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            Creators are independent contractors, not employees or agents of Buck.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            Buck does not control creator content and is not responsible for disputes between creators and users.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Payments & Subscriptions</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            All payments are processed by third-party providers.
                        </p>
                        <p className="text-muted-foreground leading-7 mb-2">
                            All payments are final and non-refundable except where required by law.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            Buck may retain a platform fee. Creators are responsible for their own taxes.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Content</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            You retain ownership of content you upload.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            You grant Buck a non-exclusive, worldwide, royalty-free license to host, stream, and display content for platform operation.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">7. Prohibited Conduct</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            You may not upload illegal content, harass others, interfere with platform operations, or circumvent payment systems.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            Buck may remove content or terminate accounts at its discretion.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">8. Health & Fitness Disclaimer</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            Participation in physical activity involves risk.
                        </p>
                        <p className="text-muted-foreground leading-7 mb-2">
                            You assume full responsibility for your health and participation.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            Buck is not liable for injuries or health issues.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">9. Availability</h2>
                        <p className="text-muted-foreground leading-7">
                            Buck does not guarantee uninterrupted service or error-free streaming.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">10. Beta Disclaimer</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            Buck may offer beta features that may be unstable or incomplete.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            Use is at your own risk.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            Buck is provided "as is."
                        </p>
                        <p className="text-muted-foreground leading-7">
                            Total liability will not exceed the amount paid by you in the last 12 months or $100, whichever is greater.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">12. Indemnification</h2>
                        <p className="text-muted-foreground leading-7">
                            You agree to indemnify Buck from claims arising from your content, conduct, or violation of these Terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">13. Arbitration & Class Action Waiver</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            All disputes will be resolved by binding arbitration.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            You waive the right to participate in class actions.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">14. Governing Law</h2>
                        <p className="text-muted-foreground leading-7">
                            These Terms are governed by the laws of the State of Texas.
                        </p>
                    </section>

                    <section className="mb-8 border-t border-border pt-8">
                        <h2 className="text-2xl font-semibold mb-4">15. Contact</h2>
                        <p className="text-muted-foreground leading-7">
                            <a href="mailto:support@buck.com" className="text-primary hover:underline font-medium">
                                support@buck.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
