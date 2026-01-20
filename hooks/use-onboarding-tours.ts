"use client";

import { useEffect, useRef, useCallback } from "react";

// TourGuideClient will be dynamically imported to avoid SSR issues
type TourGuideClientType = any;

// Storage keys for different tours
const STRIPE_CONNECT_TOUR_KEY = "buck-stripe-connect-tour-completed";
const HOST_STREAM_CONTROLS_TOUR_KEY = "buck-host-stream-controls-tour-completed";
const VIEWER_STREAM_CONTROLS_TOUR_KEY = "buck-viewer-stream-controls-tour-completed";
const GET_LIVE_TOUR_KEY = "buck-get-live-tour-completed";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const hasTourBeenCompleted = (key: string): boolean => {
    try {
        return localStorage.getItem(key) === "true";
    } catch {
        return false;
    }
};

const markTourCompleted = (key: string): void => {
    try {
        localStorage.setItem(key, "true");
    } catch {
        // Ignore localStorage errors
    }
};

// Reset all Buck tours (for testing or manual restart)
export const resetBuckTours = (): void => {
    try {
        localStorage.removeItem(STRIPE_CONNECT_TOUR_KEY);
        localStorage.removeItem(HOST_STREAM_CONTROLS_TOUR_KEY);
        localStorage.removeItem(VIEWER_STREAM_CONTROLS_TOUR_KEY);
        localStorage.removeItem(GET_LIVE_TOUR_KEY);
        localStorage.removeItem("tg_tours_complete");
    } catch {
        // Ignore localStorage errors
    }
};

// Inject custom styles for tours
const injectTourStyles = (): void => {
    const styleId = "buck-tour-guide-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
        #tg-dialog-title, 
        .tg-dialog-title {
            color: #111827 !important;
            font-weight: 700 !important;
            font-size: 1.25rem !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            min-height: 1.25rem !important;
            margin: 0 0 0.5rem 0 !important;
            line-height: 1.2 !important;
        }
        #tg-dialog-body, 
        .tg-dialog-body {
            color: #374151 !important;
            font-size: 0.95rem !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            min-height: 2rem !important;
            line-height: 1.6 !important;
            margin: 0 !important;
        }
        
        .buck-tour-dialog {
            font-family: inherit !important;
            background: #ffffff !important;
            border-radius: 0 !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid #e5e7eb !important;
            z-index: 10000 !important;
        }
        
        .buck-tour-dialog .tg-dialog-btn {
            background-color: hsl(203.8863 88.2845% 53.1373%) !important;
            color: white !important;
            padding: 0.6rem 1.2rem !important;
            border-radius: 0 !important;
            font-weight: 600 !important;
            border: none !important;
            cursor: pointer !important;
            pointer-events: auto !important;
        }
        .buck-tour-dialog #tg-dialog-prev-btn {
            background-color: #f3f4f6 !important;
            color: #4b5563 !important;
        }
        .buck-tour-dialog .tg-bar {
            background-color: hsl(203.8863 88.2845% 53.1373%) !important;
        }
        .buck-tour-dialog .tg-dot.tg-dot-active {
            background-color: hsl(203.8863 88.2845% 53.1373%) !important;
        }

        /* Close button styling */
        .buck-tour-dialog .tg-dialog-close-btn,
        .buck-tour-dialog [class*="close"] {
            position: absolute !important;
            right: 12px !important;
            top: 12px !important;
            left: auto !important;
            color: #6b7280 !important;
            cursor: pointer !important;
            font-size: 1.25rem !important;
            line-height: 1 !important;
            padding: 4px !important;
            opacity: 0.7 !important;
            transition: opacity 0.2s !important;
        }
        .buck-tour-dialog .tg-dialog-close-btn:hover,
        .buck-tour-dialog [class*="close"]:hover {
            opacity: 1 !important;
        }

        /* Dark mode support */
        .dark .buck-tour-dialog {
            background: #1f2937 !important;
            border-color: #374151 !important;
        }
        .dark #tg-dialog-title,
        .dark .tg-dialog-title {
            color: #f9fafb !important;
        }
        .dark #tg-dialog-body,
        .dark .tg-dialog-body {
            color: #d1d5db !important;
        }
        .dark .buck-tour-dialog #tg-dialog-prev-btn {
            background-color: #374151 !important;
            color: #d1d5db !important;
        }
        /* Close button white in dark mode */
        .dark .buck-tour-dialog .tg-dialog-close-btn,
        .dark .buck-tour-dialog [class*="close"] {
            color: #ffffff !important;
        }
        #tg-dialog-close-btn {
            background-color: transparent !important;
            border: none !important;
        }
        #tg-dialog-close-btn svg path {
            fill: hsl(203.8863 88.2845% 53.1373%) !important;
        }
        .dark #tg-dialog-close-btn svg path {
            fill: #ffffff !important;
        }
    `;
    document.head.appendChild(style);
};

// Cleanup tour DOM elements
const cleanupTourDOM = (): void => {
    document.querySelectorAll(".tg-dialog, .tg-backdrop, .tg-arrow").forEach((el) => el.remove());
};

// ============================================================================
// STRIPE CONNECT TOUR (For Creators)
// ============================================================================

interface StripeConnectTourState {
    isStripeConnected: boolean;
    hasSubscriptionPrice: boolean;
}

export const useStripeConnectTour = (state: StripeConnectTourState) => {
    const tourRef = useRef<TourGuideClientType | null>(null);
    const isStartingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Inject styles and cleanup on unmount
    useEffect(() => {
        injectTourStyles();
        // Dynamically import CSS on client side
        import("@sjmc11/tourguidejs/dist/css/tour.min.css");

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (tourRef.current) {
                tourRef.current.exit();
                tourRef.current = null;
            }
            cleanupTourDOM();
        };
    }, []);

    const startTour = useCallback(async () => {
        if (isStartingRef.current || hasTourBeenCompleted(STRIPE_CONNECT_TOUR_KEY)) {
            return;
        }

        // Only show tour if Stripe is not connected
        if (state.isStripeConnected) {
            markTourCompleted(STRIPE_CONNECT_TOUR_KEY);
            return;
        }

        const steps = buildStripeConnectSteps(state);
        if (steps.length === 0) return;

        isStartingRef.current = true;
        cleanupTourDOM();

        // Dynamic import of TourGuideClient
        const { TourGuideClient } = await import("@sjmc11/tourguidejs");

        const tour = new TourGuideClient({
            backdropColor: "rgba(0, 0, 0, 0.75)",
            targetPadding: 12,
            dialogWidth: 400,
            dialogMaxWidth: 500,
            nextLabel: "Next →",
            prevLabel: "← Back",
            finishLabel: "Got it!",
            showStepDots: true,
            showStepProgress: true,
            progressBar: "hsl(var(--primary))",
            exitOnClickOutside: false,
            exitOnEscape: true,
            keyboardControls: true,
            autoScroll: true,
            autoScrollSmooth: true,
            dialogAnimate: true,
            backdropAnimate: true,
            completeOnFinish: false,
            dialogClass: "buck-tour-dialog",
            steps,
        });

        tourRef.current = tour;

        tour.onFinish(() => {
            markTourCompleted(STRIPE_CONNECT_TOUR_KEY);
            isStartingRef.current = false;
            cleanupTourDOM();
        });

        tour.onAfterExit(() => {
            isStartingRef.current = false;
            cleanupTourDOM();
        });

        timeoutRef.current = setTimeout(() => {
            if (tourRef.current === tour) {
                tour.start();
            }
        }, 800);
    }, [state]);

    return {
        startTour,
        resetTour: () => {
            try {
                localStorage.removeItem(STRIPE_CONNECT_TOUR_KEY);
            } catch { }
        },
        isCompleted: hasTourBeenCompleted(STRIPE_CONNECT_TOUR_KEY),
    };
};

function buildStripeConnectSteps(state: StripeConnectTourState) {
    const contentStyle = "color: inherit; font-size: 15px; line-height: 1.6;";

    const steps = [];

    steps.push({
        title: "Welcome to Your Creator Connect! 🎉",
        content: `
            <div style="${contentStyle}">
                <p>Before you can receive payments from subscribers and tips, you need to connect your Stripe account.</p>
                <p style="margin-top: 8px; color: #6b7280;">This is a one-time setup that takes just a few minutes.</p>
            </div>
        `,
        target: "[data-tour='stripe-connect-section']",
        order: 0,
    });

    steps.push({
        title: "Connect Stripe 💳",
        content: `
            <div style="${contentStyle}">
                <p>Click this button to connect your Stripe account.</p>
                <p style="margin-top: 8px; color: #6b7280;">You'll be redirected to Stripe to complete the setup securely.</p>
            </div>
        `,
        target: "[data-tour='stripe-connect-btn']",
        order: 1,
    });

    if (!state.hasSubscriptionPrice) {
        steps.push({
            title: "Set Your Subscription Price 💰",
            content: `
                <div style="${contentStyle}">
                    <p>After connecting Stripe, set a monthly subscription price for your channel.</p>
                    <p style="margin-top: 8px; color: #6b7280;">Subscribers will pay this amount to access exclusive content and features.</p>
                </div>
            `,
            target: "[data-tour='subscription-price-section']",
            order: 2,
        });
    }

    return steps;
}

// ============================================================================
// STREAM CONTROLS TOUR (For Members and Creators)
// ============================================================================

interface StreamControlsTourState {
    isHost: boolean;
    hasJoined: boolean;
}

export const useStreamControlsTour = (state: StreamControlsTourState) => {
    const tourRef = useRef<TourGuideClientType | null>(null);
    const isStartingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Inject styles and cleanup on unmount
    useEffect(() => {
        injectTourStyles();
        // Dynamically import CSS on client side
        import("@sjmc11/tourguidejs/dist/css/tour.min.css");

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (tourRef.current) {
                tourRef.current.exit();
                tourRef.current = null;
            }
            cleanupTourDOM();
        };
    }, []);

    const startTour = useCallback(async () => {
        const tourKey = state.isHost ? HOST_STREAM_CONTROLS_TOUR_KEY : VIEWER_STREAM_CONTROLS_TOUR_KEY;

        if (isStartingRef.current || hasTourBeenCompleted(tourKey)) {
            return;
        }

        // Only show tour if user has joined the stream
        if (!state.hasJoined) {
            return;
        }

        const steps = buildStreamControlsSteps(state);
        if (steps.length === 0) return;

        isStartingRef.current = true;
        cleanupTourDOM();

        // Dynamic import of TourGuideClient
        const { TourGuideClient } = await import("@sjmc11/tourguidejs");

        const tour = new TourGuideClient({
            backdropColor: "rgba(0, 0, 0, 0.6)",
            targetPadding: 8,
            dialogWidth: 350,
            dialogMaxWidth: 420,
            nextLabel: "Next →",
            prevLabel: "← Back",
            finishLabel: "Start Streaming!",
            showStepDots: true,
            showStepProgress: true,
            progressBar: "hsl(var(--primary))",
            exitOnClickOutside: false,
            exitOnEscape: true,
            keyboardControls: true,
            autoScroll: false,
            dialogAnimate: true,
            backdropAnimate: true,
            completeOnFinish: false,
            dialogClass: "buck-tour-dialog",
            steps,
        });

        tourRef.current = tour;

        tour.onFinish(() => {
            const tourKey = state.isHost ? HOST_STREAM_CONTROLS_TOUR_KEY : VIEWER_STREAM_CONTROLS_TOUR_KEY;
            markTourCompleted(tourKey);
            isStartingRef.current = false;
            cleanupTourDOM();
        });

        tour.onAfterExit(() => {
            isStartingRef.current = false;
            cleanupTourDOM();
        });

        timeoutRef.current = setTimeout(() => {
            if (tourRef.current === tour) {
                tour.start();
            }
        }, 1000);
    }, [state]);

    return {
        startTour,
        resetTour: () => {
            try {
                const tourKey = state.isHost ? HOST_STREAM_CONTROLS_TOUR_KEY : VIEWER_STREAM_CONTROLS_TOUR_KEY;
                localStorage.removeItem(tourKey);
            } catch { }
        },
        isCompleted: hasTourBeenCompleted(state.isHost ? HOST_STREAM_CONTROLS_TOUR_KEY : VIEWER_STREAM_CONTROLS_TOUR_KEY),
    };
};

function buildStreamControlsSteps(state: StreamControlsTourState) {
    const contentStyle = "color: inherit; font-size: 14px; line-height: 1.5;";
    const steps = [];

    if (state.isHost) {
        // Host/Creator tour
        steps.push({
            title: "Your Live Stream Controls 🎬",
            content: `
                <div style="${contentStyle}">
                    <p>Welcome! Here's a quick tour of your streaming controls.</p>
                </div>
            `,
            target: "[data-tour='stream-controls']",
            order: 0,
        });

        steps.push({
            title: "Camera & Microphone 🎤",
            content: `
                <div style="${contentStyle}">
                    <p>Toggle your camera and microphone on or off during the stream.</p>
                    <p style="margin-top: 4px; color: #9ca3af;">Click the icons to mute/unmute.</p>
                </div>
            `,
            target: "[data-tour='media-controls']",
            order: 1,
        });

        steps.push({
            title: "Participant View 👥",
            content: `
                <div style="${contentStyle}">
                    <p>See all participants who have joined your stream here.</p>
                    <p style="margin-top: 4px; color: #9ca3af;">You can manage participants from this panel.</p>
                </div>
            `,
            target: "[data-tour='participants-grid']",
            order: 2,
        });

        steps.push({
            title: "Live Chat 💬",
            content: `
                <div style="${contentStyle}">
                    <p>Interact with your viewers through the live chat.</p>
                    <p style="margin-top: 4px; color: #9ca3af;">Toggle chat visibility with the chat button.</p>
                </div>
            `,
            target: "[data-tour='chat-toggle']",
            order: 3,
        });

        steps.push({
            title: "End Stream ⏹️",
            content: `
                <div style="${contentStyle}">
                    <p>When you're done, click here to end the stream.</p>
                    <p style="margin-top: 4px; color: #ef4444;">This will end the stream for all viewers.</p>
                </div>
            `,
            target: "[data-tour='end-stream-btn']",
            order: 4,
        });
    } else {
        // Viewer/Member tour
        steps.push({
            title: "Welcome to the Stream! 🎉",
            content: `
                <div style="${contentStyle}">
                    <p>Here's how to navigate and interact with the live stream.</p>
                </div>
            `,
            target: "[data-tour='video-area']",
            order: 0,
        });

        steps.push({
            title: "Join with Camera 📹",
            content: `
                <div style="${contentStyle}">
                    <p>Want to participate? Click here to join with your camera and mic.</p>
                    <p style="margin-top: 4px; color: #9ca3af;">You'll need to grant permission first.</p>
                </div>
            `,
            target: "[data-tour='join-stream-btn']",
            order: 1,
        });

        steps.push({
            title: "Send a Tip 💵",
            content: `
                <div style="${contentStyle}">
                    <p>Support the creator by sending a tip during the stream!</p>
                </div>
            `,
            target: "[data-tour='tip-button']",
            order: 2,
        });

        steps.push({
            title: "Live Chat 💬",
            content: `
                <div style="${contentStyle}">
                    <p>Chat with the host and other viewers here.</p>
                    <p style="margin-top: 4px; color: #9ca3af;">Toggle chat visibility anytime.</p>
                </div>
            `,
            target: "[data-tour='chat-toggle']",
            order: 3,
        });

        steps.push({
            title: "Fullscreen Mode 🖥️",
            content: `
                <div style="${contentStyle}">
                    <p>Click here to enjoy the stream in fullscreen.</p>
                </div>
            `,
            target: "[data-tour='fullscreen-btn']",
            order: 4,
        });
    }

    return steps;
}

// ============================================================================
// GET LIVE TOUR (For Creator Dashboard)
// ============================================================================

export const useGetLiveTour = () => {
    const tourRef = useRef<TourGuideClientType | null>(null);
    const isStartingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Inject styles and cleanup on unmount
    useEffect(() => {
        injectTourStyles();
        // Dynamically import CSS on client side
        import("@sjmc11/tourguidejs/dist/css/tour.min.css");

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (tourRef.current) {
                tourRef.current.exit();
                tourRef.current = null;
            }
            cleanupTourDOM();
        };
    }, []);

    const startTour = useCallback(async () => {
        if (isStartingRef.current || hasTourBeenCompleted(GET_LIVE_TOUR_KEY)) {
            return;
        }

        const steps = buildGetLiveSteps();
        if (steps.length === 0) return;

        isStartingRef.current = true;
        cleanupTourDOM();

        // Dynamic import of TourGuideClient
        const { TourGuideClient } = await import("@sjmc11/tourguidejs");

        const tour = new TourGuideClient({
            backdropColor: "rgba(0, 0, 0, 0.75)",
            targetPadding: 12,
            dialogWidth: 380,
            dialogMaxWidth: 450,
            nextLabel: "Next →",
            prevLabel: "← Back",
            finishLabel: "Got it!",
            showStepDots: true,
            showStepProgress: true,
            progressBar: "hsl(var(--primary))",
            exitOnClickOutside: false,
            exitOnEscape: true,
            keyboardControls: true,
            autoScroll: true,
            autoScrollSmooth: true,
            dialogAnimate: true,
            backdropAnimate: true,
            completeOnFinish: false,
            dialogClass: "buck-tour-dialog",
            steps,
        });

        tourRef.current = tour;

        // When moving from step 0 (Get Live button) to step 1 (Go Live option),
        // we need to click the button to open the dialog first
        tour.onBeforeStepChange(async () => {
            const currentStep = tour.activeStep;
            const nextStep = currentStep + 1;

            // Moving from step 0 to step 1: open the dialog
            if (currentStep === 0 && nextStep === 1) {
                const getLiveBtn = document.querySelector("[data-tour='get-live-btn']") as HTMLElement;
                if (getLiveBtn) {
                    getLiveBtn.click();
                    // Wait for dialog to open and render
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
        });

        tour.onFinish(() => {
            markTourCompleted(GET_LIVE_TOUR_KEY);
            isStartingRef.current = false;
            cleanupTourDOM();
        });

        tour.onAfterExit(() => {
            isStartingRef.current = false;
            cleanupTourDOM();
        });

        timeoutRef.current = setTimeout(() => {
            if (tourRef.current === tour) {
                tour.start();
            }
        }, 500);
    }, []);

    return {
        startTour,
        resetTour: () => {
            try {
                localStorage.removeItem(GET_LIVE_TOUR_KEY);
            } catch { }
        },
        isCompleted: hasTourBeenCompleted(GET_LIVE_TOUR_KEY),
    };
};

function buildGetLiveSteps() {
    const contentStyle = "color: inherit; font-size: 15px; line-height: 1.6;";

    const steps = [];

    steps.push({
        title: "Ready to Go Live? 🎬",
        content: `
            <div style="${contentStyle}">
                <p>Click the <strong>Get Live</strong> button to start creating content!</p>
                <p style="margin-top: 8px; color: #6b7280;">You can go live immediately or schedule for later.</p>
            </div>
        `,
        target: "[data-tour='get-live-btn']",
        order: 0,
    });

    steps.push({
        title: "Go Live Instantly 🔴",
        content: `
            <div style="${contentStyle}">
                <p>Choose <strong>Go Live</strong> to start streaming immediately.</p>
                <p style="margin-top: 8px; color: #6b7280;">You'll be taken to the preview screen to set up your stream.</p>
            </div>
        `,
        target: "[data-tour='go-live-now-btn']",
        order: 1,
    });

    steps.push({
        title: "Schedule for Later 📅",
        content: `
            <div style="${contentStyle}">
                <p>Choose <strong>Schedule</strong> to plan your stream in advance.</p>
                <p style="margin-top: 8px; color: #6b7280;">Let your followers know when to tune in!</p>
            </div>
        `,
        target: "[data-tour='schedule-stream-btn']",
        order: 2,
    });

    return steps;
}
