"use client";

import { Toaster } from "sonner";
import { useEffect, useState } from "react";

export function ResponsiveToaster() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if mobile on mount
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <Toaster
            position={isMobile ? "top-center" : "bottom-right"}
            richColors
        />
    );
}
