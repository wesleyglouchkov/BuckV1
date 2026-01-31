
import { Users, Mic, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreamStatsDisplayProps {
    isLive?: boolean;
    elapsedTime?: string;
    viewerCount: number;
    participantCount: number;
    maxParticipants?: number;
    className?: string;
}

export function StreamStatsDisplay({
    isLive = true,
    elapsedTime,
    viewerCount,
    participantCount,
    maxParticipants = 10,
    className
}: StreamStatsDisplayProps) {
    const isFull = participantCount >= maxParticipants;

    return (
        <div className={cn("flex items-center gap-3", className)}>
            {/* Live Badge */}
            {isLive && (
                <div className="bg-destructive/90 backdrop-blur-md text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white/10">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    <span className="font-bold text-[10px] md:text-xs tracking-wider uppercase mt-1">Live</span>
                    {elapsedTime && (
                        <span className="text-[10px] md:text-xs font-mono opacity-90 ml-1 mt-0.5">{elapsedTime}</span>
                    )}
                </div>
            )}

            {/* Viewer Count */}
            <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white/10">
                <Users className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/90" />
                <span className="font-semibold text-[10px] md:text-xs tracking-wide mt-0.5">{viewerCount} online</span>
            </div>

            {/* Participant Count (Stage) */}
            <div className={cn(
                "backdrop-blur-md text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white/10 transition-colors duration-300",
                isFull ? "bg-red-500/90 shadow-red-500/20 animate-pulse" : "bg-black/50"
            )}>
                <UserCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/90" />
                <span className="font-semibold text-[10px] md:text-xs tracking-wide mt-0.5">
                    {participantCount}/{maxParticipants}
                    {isFull && <span className="ml-1.5 font-bold text-white uppercase text-[9px] md:text-[10px]">FULL</span>}
                </span>
            </div>
        </div>
    );
}
