"use client";

import { useState, useEffect } from "react";
import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import { Mic, MicOff, Video, VideoOff, ChevronDown, Check, Volume2, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Device {
    deviceId: string;
    label: string;
}

interface VideoDeviceControlProps {
    isVideoEnabled: boolean;
    onToggle: () => void;
    currentCameraTrack: ICameraVideoTrack | null;
}

export function VideoDeviceControl({ isVideoEnabled, onToggle, currentCameraTrack }: VideoDeviceControlProps) {
    const [cameras, setCameras] = useState<Device[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const devices = await AgoraRTC.getCameras();
                const deviceList = devices.map(d => ({
                    deviceId: d.deviceId,
                    label: (d.label || `Camera ${d.deviceId.slice(0, 5)}...`).replace(/\s*\(.*\)$/, "")
                }));
                setCameras(deviceList);

                // Try to get current device from track
                if (currentCameraTrack) {
                    const currentLabel = currentCameraTrack.getTrackLabel();
                    const matched = deviceList.find(d => d.label === currentLabel);
                    if (matched) setSelectedDeviceId(matched.deviceId);
                    else if (deviceList.length > 0) setSelectedDeviceId(deviceList[0].deviceId);
                }

            } catch (e) {
                console.error("Failed to fetch cameras:", e);
            }
        };

        fetchDevices();

        // Listen for device changes
        AgoraRTC.onCameraChanged = () => {
            fetchDevices();
        };

    }, [currentCameraTrack]);

    const handleDeviceSelect = async (deviceId: string) => {
        if (!currentCameraTrack) return;
        try {
            await currentCameraTrack.setDevice(deviceId);
            setSelectedDeviceId(deviceId);
            toast.success("Camera switched successfully");
        } catch (e) {
            console.error("Error switching camera:", e);
            toast.error("Failed to switch camera");
        }
    };

    return (
        <div className="flex items-center group relative">
            <Button
                onClick={onToggle}
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="icon"
                className={cn(
                    "w-9 h-9 rounded-r-none border-r border-white/10 shadow-lg ring-1 ring-white/10 relative z-10",
                    !isVideoEnabled && "ring-destructive"
                )}
            >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>

            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={isVideoEnabled ? "secondary" : "destructive"}
                        size="icon"
                        className={cn(
                            "w-5 h-9 rounded-l-none shadow-lg ring-1 ring-white/10 px-0",
                            !isVideoEnabled && "ring-destructive"
                        )}
                    >
                        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" sideOffset={10} className="w-64 bg-background/95 backdrop-blur-sm border-white/10 text-foreground p-0 shadow-2xl rounded-none overflow-hidden">
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-transparent">
                        Select Camera
                    </div>
                    {/* <DropdownMenuSeparator className="bg-white/10" /> Removed default separator to match new style */}
                    {cameras.length === 0 ? (
                        <div className="px-2 py-2 text-xs text-muted-foreground">No cameras found</div>
                    ) : (
                        cameras.map((device) => (
                            <DropdownMenuItem
                                key={device.deviceId}
                                onClick={() => handleDeviceSelect(device.deviceId)}
                                className={cn(
                                    "flex items-center justify-between cursor-pointer hover:bg-secondary/50 hover:!text-white focus:bg-secondary/50 text-sm py-2.5 px-4 outline-none transition-colors",
                                    selectedDeviceId === device.deviceId && "bg-secondary text-secondary-foreground hover:!text-white"
                                )}
                            >
                                <span className="truncate">{device.label}</span>
                                {selectedDeviceId === device.deviceId && <Check className="w-4 h-4" />}
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

interface AudioDeviceControlProps {
    isAudioEnabled: boolean;
    onToggle: () => void;
    currentMicTrack: IMicrophoneAudioTrack | null;
}

export function AudioDeviceControl({ isAudioEnabled, onToggle, currentMicTrack }: AudioDeviceControlProps) {
    const [mics, setMics] = useState<Device[]>([]);
    const [speakers, setSpeakers] = useState<Device[]>([]);
    const [selectedMicId, setSelectedMicId] = useState<string>("");
    const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                // Mics
                const micList = await AgoraRTC.getMicrophones();
                const formattedMics = micList.map(d => ({
                    deviceId: d.deviceId,
                    label: (d.label || `Mic ${d.deviceId.slice(0, 5)}...`).replace(/\s*\(.*\)$/, "")
                }));
                setMics(formattedMics);

                // Speakers
                const speakerList = await AgoraRTC.getPlaybackDevices();
                const formattedSpeakers = speakerList.map(d => ({
                    deviceId: d.deviceId,
                    label: (d.label || `Speaker ${d.deviceId.slice(0, 5)}...`).replace(/\s*\(.*\)$/, "")
                }));
                setSpeakers(formattedSpeakers);

                // Try to match current mic
                if (currentMicTrack) {
                    const currentLabel = currentMicTrack.getTrackLabel();
                    const matched = formattedMics.find(d => d.label === currentLabel);
                    if (matched) setSelectedMicId(matched.deviceId);
                    else if (formattedMics.length > 0) setSelectedMicId(formattedMics[0].deviceId);
                }

            } catch (e) {
                console.error("Failed to fetch audio devices:", e);
            }
        };

        fetchDevices();

        AgoraRTC.onMicrophoneChanged = fetchDevices;
        AgoraRTC.onPlaybackDeviceChanged = fetchDevices;

    }, [currentMicTrack]);

    const handleMicSelect = async (deviceId: string) => {
        if (!currentMicTrack) return;
        try {
            await currentMicTrack.setDevice(deviceId);
            setSelectedMicId(deviceId);
            toast.success("Microphone switched successfully");
        } catch (e) {
            console.error("Error switching microphone:", e);
            toast.error("Failed to switch microphone");
        }
    };

    const handleSpeakerSelect = async (deviceId: string) => {
        // Note: This relies on browser support for setSinkId
        // And assumes we can access audio elements globally or Agora handles it.
        // This is a best-effort implementation for speakers.
        setSelectedSpeakerId(deviceId);
        toast.info("Speaker selection updated (if supported)");

        // Try to verify if we can set it via Agora SDK for remote tracks?
        // Usually output device is set on the HTMLAudioElement.
        // We'll leave this as a UI selection for now as Agora Web SDK
        // doesn't have a single global "setOutputDevice" that covers all created elements automatically without tracking them.
    };

    return (
        <div className="flex items-center group relative">
            <Button
                onClick={onToggle}
                variant={isAudioEnabled ? "secondary" : "destructive"}
                size="icon"
                className={cn(
                    "w-9 h-9 rounded-r-none border-r border-white/10 shadow-lg ring-1 ring-white/10 relative z-10",
                    !isAudioEnabled && "ring-destructive"
                )}
            >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>

            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={isAudioEnabled ? "secondary" : "destructive"}
                        size="icon"
                        className={cn(
                            "w-5 h-9 rounded-l-none shadow-lg ring-1 ring-white/10 px-0",
                            !isAudioEnabled && "ring-destructive"
                        )}
                    >
                        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" sideOffset={10} className="w-64 bg-background/95 backdrop-blur-sm border-white/10 text-foreground p-0 shadow-2xl rounded-none overflow-hidden">

                    {/* Microphones */}
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-transparent">
                        Microphone
                    </div>
                    {mics.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground">No microphones found</div>
                    ) : (
                        mics.map((device) => (
                            <DropdownMenuItem
                                key={device.deviceId}
                                onClick={() => handleMicSelect(device.deviceId)}
                                className={cn(
                                    "flex items-center justify-between cursor-pointer hover:bg-secondary/50 hover:!text-white focus:bg-secondary/50 text-sm py-2.5 px-4 outline-none transition-colors",
                                    selectedMicId === device.deviceId && "bg-secondary text-secondary-foreground hover:!text-white"
                                )}
                            >
                                <span className="truncate">{device.label}</span>
                                {selectedMicId === device.deviceId && <Check className="w-4 h-4" />}
                            </DropdownMenuItem>
                        ))
                    )}

                    <div className="h-px bg-border my-1" />

                    {/* Speakers */}
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-transparent">
                        Speakers
                    </div>
                    {speakers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground">No speakers found</div>
                    ) : (
                        speakers.map((device) => (
                            <DropdownMenuItem
                                key={device.deviceId}
                                onClick={() => handleSpeakerSelect(device.deviceId)}
                                className={cn(
                                    "flex items-center justify-between cursor-pointer hover:bg-secondary/50 hover:!text-white focus:bg-secondary/50 text-sm py-2.5 px-4 outline-none transition-colors",
                                    selectedSpeakerId === device.deviceId && "bg-secondary text-secondary-foreground hover:!text-white"
                                )}
                            >
                                <span className="truncate">{device.label}</span>
                                {selectedSpeakerId === device.deviceId && <Check className="w-4 h-4" />}
                            </DropdownMenuItem>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
