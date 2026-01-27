import { useCallback, useEffect } from 'react';

/**
 * A reusable hook to scroll the window to the top smoothly.
 * 
 * Usage:
 * 1. Imperative: const scrollToTop = useScrollToTop(); scrollToTop();
 * 2. Reactive: useScrollToTop(currentPage); // Scrolls whenever currentPage changes
 * 
 * @param dependency - Optional dependency that triggers the scroll when it changes
 */
export function useScrollToTop(dependency?: any) {
    const scrollToTop = useCallback(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, []);

    useEffect(() => {
        if (dependency !== undefined) {
            scrollToTop();
        }
    }, [dependency, scrollToTop]);

    return scrollToTop;
}
