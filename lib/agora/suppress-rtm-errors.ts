"use client";

// Suppress known transient Agora RTM errors that occur during connection probing
// These are expected behavior as the SDK tests multiple gateways
const originalConsoleError = console.error;
const rtmErrorPatterns = [
    "socket connection closed",
    "No cloud proxy server to connect",
    "WebSocket connection",  // Covers both "failed" and "to 'wss://...' failed"
    "RTM:ERROR",
    "edge.agora.io",
    "edge.sd-rtn.com",
];

console.error = (...args: any[]) => {
    const message = args.join(" ");
    const shouldSuppress = rtmErrorPatterns.some(pattern => message.includes(pattern));
    if (!shouldSuppress) {
        originalConsoleError.apply(console, args);
    }
};

export { }; // Make this a module
