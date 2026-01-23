'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, Send, Paperclip, X } from "lucide-react";
import { userService } from "@/services";
import { getSupportImageUploadUrl, getSignedStreamUrl } from "@/app/actions/s3-actions";

export default function HelpPage() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload an image (JPG, PNG, WEBP, GIF)");
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error("File too large. Maximum size is 5MB");
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeFile = () => {
        setSelectedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let imageUrl = '';

            // Handle image upload if a file is selected
            if (selectedFile) {
                const uploadRes = await getSupportImageUploadUrl(
                    selectedFile.name,
                    selectedFile.type,
                    selectedFile.size
                );

                if (!uploadRes.success || !uploadRes.uploadUrl || !uploadRes.key) {
                    throw new Error(uploadRes.error || "Failed to get upload URL");
                }

                // Upload to S3
                const res = await fetch(uploadRes.uploadUrl, {
                    method: 'PUT',
                    body: selectedFile,
                    headers: {
                        'Content-Type': selectedFile.type,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to upload image to S3");
                }

                // Get signed URL for the email (2 hour expiration)
                const signedUrl = await getSignedStreamUrl(uploadRes.key);
                imageUrl = signedUrl || `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${uploadRes.key}`;
            }

            const response = await userService.submitHelpRequest({
                ...formData,
                imageUrl: imageUrl || undefined
            });

            if (response.success) {
                toast.success(response.message || "Help request sent successfully");
                // Reset form
                setFormData(prev => ({
                    ...prev,
                    phoneNumber: '',
                    country: '',
                    issue: ''
                }));
                removeFile();
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
                <div className="mb-10 flex items-center gap-4">
                    <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
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
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold">Contact Support</h1>
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
                                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Ex: United States"
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
                                className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe your issue or question here..."
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium leading-none">
                                Attachment (Optional)
                            </label>
                            <div className="flex flex-col gap-4">
                                {!imagePreview ? (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center justify-center gap-2 w-max px-4 py-2 border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-sm font-medium"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                        Upload Image (Max 5MB)
                                    </button>
                                ) : (
                                    <div className="relative inline-block">
                                        <div className="relative h-40 w-40 border border-border bg-muted overflow-hidden">
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm transition-colors"
                                            title="Remove image"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Supported formats: JPG, PNG, WEBP, GIF. Max file size: 5MB.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
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
