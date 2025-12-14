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
                    <p className="text-muted-foreground mb-8">Last updated: December 13, 2025</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-7">
                            By accessing or using BUCK (the "Platform"), a livestream fitness platform operated by Wesley Glouchkov ("we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                        <p className="text-muted-foreground leading-7">
                            BUCK provides a web-based platform for creators to host live interactive fitness classes and for members to participate in live classes, watch replays, and subscribe to creators. Features include authentication, discovery of classes, live video streaming with camera-on participation, chat, scheduling, replay storage, and payment processing via Stripe Connect.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                        <p className="text-muted-foreground leading-7">
                            You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate information and to notify us immediately of any unauthorized use.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Creator and Member Roles</h2>
                        <ul className="list-none space-y-3 text-muted-foreground leading-7">
                            <li>
                                <strong className="text-foreground">Creators:</strong> May schedule and host classes, upload replays, manage subscriptions, and receive payouts via Stripe Connect.
                            </li>
                            <li>
                                <strong className="text-foreground">Members:</strong> May join live classes, participate with camera and microphone, chat, and access replays upon subscription.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Subscriptions and Payments</h2>
                        <p className="text-muted-foreground leading-7 mb-4">
                            Members may subscribe to creators through Stripe Connect. Subscriptions auto-renew until canceled. All payments are processed by Stripe and subject to Stripe's terms. We do not store payment information. Creators are responsible for any taxes related to payouts.
                        </p>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">Platform Fees</h3>
                        <p className="text-muted-foreground leading-7">
                            BUCK deducts the following platform fees from transactions:
                        </p>
                        <ul className="list-disc pl-6 mt-2 text-muted-foreground leading-7">
                            <li><strong>20%</strong> from subscriptions, replays, and paid classes.</li>
                            <li><strong>5%</strong> from tips.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Content and Conduct</h2>
                        <p className="text-muted-foreground leading-7">
                            You are responsible for all content you upload, stream, or post (including video, chat messages, and replays). You grant us a worldwide, non-exclusive license to host and display your content on the Platform. You agree not to post illegal, harmful, abusive, or inappropriate content. We may remove content or suspend accounts that violate these Terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">7. Live Classes</h2>
                        <p className="text-muted-foreground leading-7">
                            Participation in live classes with camera-on is optional but encouraged. You consent to being recorded if you enable your camera during a class that is later saved as a replay. Replays may be made available to subscribers.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-7">
                            The Platform and its original content (excluding user-generated content) are owned by us or our licensors. You may not copy, modify, or distribute Platform content without permission.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
                        <p className="text-muted-foreground leading-7">
                            We may terminate or suspend your account at any time for violation of these Terms. Upon termination, your access to the Platform will cease.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">10. Disclaimer and Limitation of Liability</h2>
                        <p className="text-muted-foreground leading-7">
                            The Platform is provided "as is" without warranties. We are not liable for any indirect damages or for injuries occurring during workouts. Use the Platform at your own risk.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
                        <p className="text-muted-foreground leading-7">
                            We may update these Terms at any time. Continued use of the Platform constitutes acceptance of the updated Terms.
                        </p>
                    </section>

                    <section className="mb-8 border-t border-border pt-8">
                        <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
                        <p className="text-muted-foreground leading-7">
                            For questions about these Terms, contact us at{' '}
                            <a href="mailto:support@buckfitness.com" className="text-primary hover:underline font-medium">
                                support@buckfitness.com
                            </a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
