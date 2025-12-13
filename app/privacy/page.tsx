import React from 'react';
import Image from "next/image";
import Link from "next/link";

export default function PrivacyPage() {
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
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-muted-foreground mb-8">Last updated: December 13, 2025</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p className="text-muted-foreground leading-7">
                            BUCK ("we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our livestream fitness platform (the "Platform").
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                        <p className="text-muted-foreground mb-4 leading-7">We collect:</p>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7">
                            <li>
                                <strong className="text-foreground">Account Information:</strong> Email, password (hashed), profile details, and role (creator/member).
                            </li>
                            <li>
                                <strong className="text-foreground">Payment Information:</strong> Processed via Stripe Connect; we do not store full card details.
                            </li>
                            <li>
                                <strong className="text-foreground">Usage Data:</strong> Classes joined, subscriptions, viewing history, and analytics.
                            </li>
                            <li>
                                <strong className="text-foreground">Live Class Data:</strong> Video/audio streams (real-time only, unless recorded as replay), chat messages, and participant metadata.
                            </li>
                            <li>
                                <strong className="text-foreground">Replays:</strong> Uploaded videos stored on AWS S3 (accessible to subscribers).
                            </li>
                            <li>
                                <strong className="text-foreground">Device/Technical Data:</strong> IP address, browser type, and device information for security and performance.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                        <p className="text-muted-foreground leading-7">
                            To provide and improve the Platform, process payments, enable live interactions, display replays, communicate with you, ensure security, and comply with legal obligations.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
                        <p className="text-muted-foreground mb-4 leading-7">We share information with:</p>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7">
                            <li>Stripe for payment processing.</li>
                            <li>AWS for hosting and storage.</li>
                            <li>Agora.io for real-time streaming.</li>
                            <li>Subscribers (your video/chat if you participate visibly in a class or replay).</li>
                            <li>Legal authorities when required.</li>
                        </ul>
                        <p className="text-muted-foreground mt-4 leading-7">We do not sell your personal information.</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Live Video and Recordings</h2>
                        <p className="text-muted-foreground leading-7">
                            When you enable your camera/microphone in a live class, other participants and the host can see/hear you in real time. If the host records the class, your video/audio may be included in the replay accessible to subscribers. You control your camera/mic settings.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
                        <p className="text-muted-foreground leading-7">
                            We use industry-standard measures (encryption, secure hosting on AWS, Auth.js sessions) to protect your data, but no system is 100% secure.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
                        <p className="text-muted-foreground leading-7">
                            You may access, update, or delete your account data by contacting us. You can also manage subscriptions via Stripe.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
                        <p className="text-muted-foreground leading-7">
                            We use essential cookies and session storage for authentication and functionality. Analytics may be added in the future.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
                        <p className="text-muted-foreground leading-7">
                            The Platform is not intended for users under 13. We do not knowingly collect data from children.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">10. Changes to Policy</h2>
                        <p className="text-muted-foreground leading-7">
                            We may update this Policy. Continued use of the Platform means you accept the changes.
                        </p>
                    </section>

                    <section className="mb-8 border-t border-border pt-8">
                        <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
                        <p className="text-muted-foreground leading-7">
                            For privacy questions, email{' '}
                            <a href="mailto:privacy@buckfitness.com" className="text-primary hover:underline font-medium">
                                privacy@buckfitness.com
                            </a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
