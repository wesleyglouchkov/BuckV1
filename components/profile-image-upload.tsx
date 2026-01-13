"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Loader2, X, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import {
    getProfileImageUploadUrl,
    deleteOldProfileImage,
    getProfileImageUrl
} from "@/app/actions/s3-actions";
import {
    FILE_SIZE_LIMITS,
    ALLOWED_FILE_TYPES,
    formatFileSize,
    validateFile
} from "@/lib/constants/s3-constants";
import { cn } from "@/lib/utils";

interface ProfileImageUploadProps {
    currentImageKey?: string | null;
    userName?: string;
    size?: "sm" | "md" | "lg" | "xl";
    onUploadComplete?: (newKey: string) => void;
    onDeleteComplete?: () => void;
    onUploadError?: (error: string) => void;
    disabled?: boolean;
    className?: string;
}

export default function ProfileImageUpload({
    currentImageKey,
    userName = "User",
    size = "xl",
    onUploadComplete,
    onDeleteComplete,
    onUploadError,
    disabled = false,
    className,
}: ProfileImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingKey, setPendingKey] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch signed URL for current image on mount/change
    useEffect(() => {
        const fetchSignedUrl = async () => {
            if (currentImageKey) {
                const url = await getProfileImageUrl(currentImageKey);
                setSignedImageUrl(url);
            } else {
                setSignedImageUrl(null);
            }
        };
        fetchSignedUrl();
    }, [currentImageKey]);

    const sizeClasses = {
        sm: "w-12 h-12",
        md: "w-16 h-16",
        lg: "w-20 h-20",
        xl: "w-24 h-24",
    };

    const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        const validation = validateFile(
            file,
            ALLOWED_FILE_TYPES.IMAGE,
            FILE_SIZE_LIMITS.PROFILE_IMAGE
        );

        if (!validation.valid) {
            toast.error(validation.error);
            onUploadError?.(validation.error || "Invalid file");
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        setIsUploading(true);

        try {
            // Get presigned upload URL
            const result = await getProfileImageUploadUrl(
                file.name,
                file.type,
                file.size
            );

            if (!result.success || !result.uploadUrl || !result.key) {
                throw new Error(result.error || "Failed to get upload URL");
            }

            // Upload directly to S3
            const uploadResponse = await fetch(result.uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload image");
            }

            // Store pending info for confirmation
            setPendingFile(file);
            setPendingKey(result.key);
            toast.success("Image uploaded! Click the checkmark to confirm.");
        } catch (error) {
            console.error("Upload error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
            toast.error(errorMessage);
            onUploadError?.(errorMessage);
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [onUploadError]);

    const confirmUpload = useCallback(async () => {
        if (!pendingKey) return;

        try {
            // Delete old image if exists
            if (currentImageKey) {
                await deleteOldProfileImage(currentImageKey);
            }

            // Notify parent of successful upload
            onUploadComplete?.(pendingKey);
            toast.success("Profile image updated!");

            // Clear pending state
            setPendingFile(null);
            setPendingKey(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error("Error confirming upload:", error);
            toast.error("Failed to update profile image");
        }
    }, [pendingKey, currentImageKey, onUploadComplete]);

    const cancelUpload = useCallback(async () => {
        if (pendingKey) {
            // Delete the uploaded file since user cancelled
            try {
                await deleteOldProfileImage(pendingKey);
            } catch (error) {
                console.error("Error deleting cancelled upload:", error);
            }
        }

        // Clear states
        setPendingFile(null);
        setPendingKey(null);
        setPreviewUrl(null);
    }, [pendingKey]);

    const handleDeleteImage = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering file upload

        if (!currentImageKey || isDeleting) return;

        setIsDeleting(true);
        try {
            await deleteOldProfileImage(currentImageKey);
            onDeleteComplete?.();
            toast.success("Profile image deleted!");
        } catch (error) {
            console.error("Error deleting image:", error);
            toast.error("Failed to delete profile image");
        } finally {
            setIsDeleting(false);
        }
    }, [currentImageKey, isDeleting, onDeleteComplete]);

    const handleClick = () => {
        if (!disabled && !isUploading && !pendingKey && !isDeleting) {
            fileInputRef.current?.click();
        }
    };

    const displayImage = previewUrl || signedImageUrl;
    const hasExistingImage = !!currentImageKey && !!signedImageUrl && !pendingKey;

    return (
        <div className={cn("relative inline-block", className)}>
            <div
                className={cn(
                    "relative group cursor-pointer",
                    sizeClasses[size],
                    disabled && "cursor-not-allowed opacity-60"
                )}
                onClick={handleClick}
            >
                {displayImage ? (
                    <img
                        src={displayImage}
                        alt={userName}
                        className={cn(
                            "object-cover border-2 border-border",
                            sizeClasses[size]
                        )}
                    />
                ) : (
                    <UserAvatar
                        name={userName}
                        className={sizeClasses[size]}
                        size={size}
                    />
                )}

                {/* Overlay on hover (Add/Change) */}
                {!disabled && !isUploading && !pendingKey && !isDeleting && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="flex flex-col items-center gap-2">
                            <Camera className="w-6 h-6 text-white" />
                            <span className="text-[10px] font-medium text-white uppercase tracking-wider">Change</span>
                        </div>
                    </div>
                )}

                {/* Loading overlay */}
                {(isUploading || isDeleting) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Delete button - Sleek integrated design */}
            {hasExistingImage && !disabled && !isDeleting && (
                <button
                    type="button"
                    className="absolute top-1 right-1 p-1.5 rounded-full bg-black/20 hover:bg-red-500/80 backdrop-blur-md text-white/70 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm border border-white/10"
                    onClick={handleDeleteImage}
                    title="Remove image"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Confirm/Cancel buttons when pending (Floating Glass Design) */}
            {pendingKey && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-1 bg-background/80 backdrop-blur-md border border-border shadow-xl rounded-full">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-full bg-green-500/20 hover:bg-green-500 text-green-600 hover:text-white transition-all"
                        onClick={confirmUpload}
                    >
                        <Check className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-4 bg-border" />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500 text-red-600 hover:text-white transition-all"
                        onClick={cancelUpload}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_FILE_TYPES.IMAGE.join(",")}
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || isUploading || isDeleting}
            />

            {/* Upload hint */}
            {!disabled && !pendingKey && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                    Max {formatFileSize(FILE_SIZE_LIMITS.PROFILE_IMAGE)}
                </p>
            )}
        </div>
    );
}
