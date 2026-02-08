import { useCallback } from "react";

/**
 * Hook to play sound effects
 * @param soundPath Path to the sound file (relative to public folder)
 * @param volume Volume level (0.0 to 1.0), defaults to 1.0
 */
export function useSoundEffect(soundPath: string, volume: number = 0.5) {
    const play = useCallback(() => {
        try {
            const audio = new Audio(soundPath);
            audio.volume = volume;
            audio.play().catch((error) => {
                // Autoplay policy might block audio if no user interaction has occurred
                console.warn("Audio playback failed:", error);
            });
        } catch (error) {
            console.error("Error initializing audio:", error);
        }
    }, [soundPath, volume]);

    return play;
}

/**
 * Specific hook for the user join sound
 */
export function useJoinSound() {
    return useSoundEffect("/sounds/join_notification.mp3", 0.6);
}
