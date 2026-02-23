import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";

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
                    <p className="text-muted-foreground mb-8">Effective Date: February 18, 2026</p>

                    <p className="text-muted-foreground leading-7 mb-8">
                        Buck ("Buck," "we," "us," or "our") values your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our website, applications, and services (the "Platform").
                        By using Buck, you agree to the practices described in this Privacy Policy.
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>

                        <h3 className="text-lg font-semibold mb-3 text-foreground">a. Information You Provide</h3>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7 mb-4">
                            <li>Name</li>
                            <li>Email address</li>
                            <li>Account credentials</li>
                            <li>Creator profile information</li>
                            <li>Communications with Buck</li>
                        </ul>

                        <h3 className="text-lg font-semibold mb-3 text-foreground">b. Automatically Collected Information</h3>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7 mb-4">
                            <li>IP address</li>
                            <li>Device type, browser type, operating system</li>
                            <li>Usage data (pages viewed, streams watched, interactions)</li>
                            <li>Referring URLs</li>
                            <li>Log data and timestamps</li>
                        </ul>

                        <h3 className="text-lg font-semibold mb-3 text-foreground">c. Cookies & Tracking Technologies</h3>
                        <p className="text-muted-foreground leading-7 mb-2">We use cookies, pixels, and similar technologies to:</p>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7">
                            <li>Enable core functionality</li>
                            <li>Analyze usage</li>
                            <li>Serve and measure advertisements</li>
                            <li>Improve performance and user experience</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                        <p className="text-muted-foreground leading-7 mb-2">We use collected information to:</p>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7">
                            <li>Operate and maintain the Platform</li>
                            <li>Provide live streaming and subscriptions</li>
                            <li>Process payments</li>
                            <li>Serve ads and measure ad performance</li>
                            <li>Communicate updates and support</li>
                            <li>Monitor security and prevent abuse</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. Google Ads & Third-Party Advertising</h2>
                        <p className="text-muted-foreground leading-7 mb-4">
                            Buck uses Google Ads and may use Google Analytics and other third-party advertising partners.
                        </p>

                        <h3 className="text-lg font-semibold mb-3 text-foreground">How Google Uses Data</h3>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7 mb-4">
                            <li>Google uses cookies (including the DoubleClick cookie) to serve ads based on users' visits to this and other websites.</li>
                            <li>Google's use of advertising cookies enables it and its partners to serve ads based on user activity across the internet.</li>
                        </ul>

                        <p className="text-muted-foreground leading-7 mb-2">Users may opt out of personalized advertising by visiting:</p>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7 mb-4">
                            <li>
                                Google Ads Settings:{' '}
                                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                    https://adssettings.google.com
                                </a>
                            </li>
                            <li>
                                Network Advertising Initiative:{' '}
                                <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                    https://optout.networkadvertising.org
                                </a>
                            </li>
                        </ul>
                        <p className="text-muted-foreground leading-7">
                            Buck does not control how third-party advertisers collect or use your data.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Third-Party Service Providers</h2>
                        <p className="text-muted-foreground leading-7 mb-2">We may share information with trusted third-party providers that assist with:</p>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7 mb-4">
                            <li>Hosting and cloud infrastructure</li>
                            <li>Live streaming services</li>
                            <li>Payment processing</li>
                            <li>Analytics and advertising</li>
                            <li>Customer support</li>
                        </ul>
                        <p className="text-muted-foreground leading-7">
                            These providers may only use data as necessary to perform services on our behalf.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Data Sharing & Disclosure</h2>
                        <p className="text-muted-foreground leading-7 mb-2">We may disclose information:</p>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7 mb-4">
                            <li>To service providers and partners</li>
                            <li>To comply with legal obligations or lawful requests</li>
                            <li>To protect the rights, safety, or property of Buck or users</li>
                            <li>In connection with a merger, sale, or acquisition</li>
                        </ul>
                        <p className="text-muted-foreground leading-7 font-medium">
                            We do not sell personal information.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
                        <p className="text-muted-foreground leading-7 mb-2">We retain personal information only as long as necessary to:</p>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7">
                            <li>Provide services</li>
                            <li>Comply with legal obligations</li>
                            <li>Resolve disputes</li>
                            <li>Enforce agreements</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">7. Your Privacy Rights</h2>

                        <h3 className="text-lg font-semibold mb-3 text-foreground">a. California (CCPA)</h3>
                        <p className="text-muted-foreground leading-7 mb-2">California residents have the right to:</p>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7 mb-4">
                            <li>Request access to personal data</li>
                            <li>Request deletion of personal data</li>
                            <li>Opt out of data sharing where applicable</li>
                        </ul>

                        <h3 className="text-lg font-semibold mb-3 text-foreground">b. European Union (GDPR)</h3>
                        <p className="text-muted-foreground leading-7 mb-2">EU users may request:</p>
                        <ul className="list-disc ml-6 space-y-2 text-muted-foreground leading-7 mb-4">
                            <li>Access to personal data</li>
                            <li>Correction or deletion</li>
                            <li>Restriction or objection to processing</li>
                            <li>Data portability</li>
                        </ul>
                        <p className="text-muted-foreground leading-7">
                            Requests can be sent to{' '}
                            <a href="mailto:support@buckstreaming.com" className="text-primary hover:underline font-medium">
                                support@buckstreaming.com
                            </a>.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">8. Data Security</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            We use reasonable administrative, technical, and physical safeguards to protect information.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            However, no method of transmission or storage is 100% secure.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            Buck is not intended for children under 13.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            We do not knowingly collect data from children under 13.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            Your information may be processed and stored in the United States or other countries where our service providers operate.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            By using Buck, you consent to such transfers.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
                        <p className="text-muted-foreground leading-7 mb-2">
                            We may update this Privacy Policy from time to time.
                        </p>
                        <p className="text-muted-foreground leading-7">
                            Continued use of the Platform constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section className="mb-8 border-t border-border pt-8">
                        <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
                        <p className="text-muted-foreground leading-7">
                            For questions or privacy requests, contact:
                        </p>
                        <p className="text-muted-foreground leading-7 mt-2">
                            📧{' '}
                            <a href="mailto:support@buckstreaming.com" className="text-primary hover:underline font-medium">
                                support@buckstreaming.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}
