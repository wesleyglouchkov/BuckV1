"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the current browser is Safari
 * Useful for handling Safari-specific rendering glitches or behavior
 */
export function useIsSafari() {
    const [isSafari, setIsSafari] = useState(false);

    useEffect(() => {
        // Standard Safari detection (excludes Chrome/Android which often include "Safari" in UA)
        const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        setIsSafari(isSafariBrowser);
    }, []);

    return isSafari;
}
