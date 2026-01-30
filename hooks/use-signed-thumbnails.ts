import { useState, useEffect } from 'react';
import { generateSecureThumbnailToken } from '@/app/actions/s3-actions';

/**
 * Custom hook to batch sign S3 URLs for video thumbnails.
 * Useful for lists of streams where the thumbnail image is missing.
 */
export function useSignedThumbnails(items: any[]) {
    const [signedThumbnails, setSignedThumbnails] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!items || items.length === 0) return;

        const signThumbnails = async () => {
            // Only process items that have a video URL but NO thumbnail image
            const signNeeded = items.filter((item: any) =>
                (item.replayUrl || item.streamUrl) && !item.thumbnail && !signedThumbnails[item.id]
            );

            if (signNeeded.length === 0) return;

            try {
                const results = await Promise.all(
                    signNeeded.map(async (item: any) => {
                        const urlToSign = item.replayUrl || item.streamUrl;
                        try {
                            // Use secure token generation instead of direct S3 signing
                            const token = await generateSecureThumbnailToken(urlToSign, navigator.userAgent);
                            const url = token ? `/api/secure-thumbnail?token=${encodeURIComponent(token)}` : null;
                            return { id: item.id, url };
                        } catch (e) {
                            return { id: item.id, url: null };
                        }
                    })
                );

                setSignedThumbnails(prev => {
                    const next = { ...prev };
                    results.forEach(res => {
                        if (res.url) next[res.id] = res.url;
                    });
                    return next;
                });
            } catch (error) {
                console.error("Error signing thumbnails:", error);
            }
        };

        signThumbnails();
    }, [items]);

    return signedThumbnails;
}
