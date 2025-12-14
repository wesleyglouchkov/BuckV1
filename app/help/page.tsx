'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { userService } from "@/services";

export default function HelpPage() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        country: '',
        issue: ''
    });

    // Pre-fill form with session data when available
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || '',
                email: session.user.email || '',
            }));
        }
    }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await userService.submitHelpRequest(formData);

            if (response.success) {
                toast.success(response.message || "Help request sent successfully");
                // Reset form (except maybe name/email?)
                setFormData(prev => ({
                    ...prev,
                    phoneNumber: '',
                    country: '',
                    issue: ''
                }));
            } else {
                toast.error(response.message || "Failed to send help request");
            }
        } catch (error: any) {
            console.error("Help request error:", error);
            const errorMessage = error.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <div className="mb-10">
                    <Link href="/" className="flex gap-4 items-center hover:opacity-80 transition-opacity">
                        <div>
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
                        </div>
                        <h1 className="mt-5 text-3xl md:text-4xl font-bold mb-4">Contact Support</h1>
                    </Link>
                </div>

                <div className="max-w-2xl mx-auto">

                    <p className="text-muted-foreground mb-8 text-lg">
                        Have a question or run into an issue? Fill out the form below and we'll get back to you as soon as possible.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="flex h-10 w-full  border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="flex h-10 w-full  border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="phoneNumber" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="flex h-10 w-full  border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="country" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="flex h-10 w-full  border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="United States"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="issue" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Issue <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="issue"
                                name="issue"
                                required
                                value={formData.issue}
                                onChange={handleChange}
                                rows={5}
                                className="flex w-full  border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe your issue or question here..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center  text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Request
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
