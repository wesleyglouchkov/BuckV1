"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ban, ShieldBan } from "lucide-react";
import { ModerationTabs } from "@/components/admin/ModerationTabs";
import { MessageFilters } from "@/components/admin/MessageFilters";
import { FlaggedMessagesTable } from "@/components/admin/FlaggedMessagesTable";
import { ContentGrid } from "@/components/admin/ContentGrid";

const badWordsFilters = [
    "fuck", "fucking", "motherfucker", "shit", "bitch", "asshole",
    "bastard", "son of a bitch", "dickhead", "crackhead", "douchebag",
    "cunt", "slut", "whore", "pussy", "nigger"
];

// Mock data - will be replaced with API data
const mockMessages = [
    {
        id: "1",
        content: "This is a fucking terrible message",
        sender: {
            name: "John Doe",
            email: "john@example.com",
            warningCount: 3
        },
        timestamp: "2024-12-08T10:30:00Z",
        flagged: true
    },
    {
        id: "2",
        content: "You are a motherfucker",
        sender: {
            name: "Jane Smith",
            email: "jane@example.com",
            warningCount: 1
        },
        timestamp: "2024-12-08T09:15:00Z",
        flagged: true
    },
    // Add more mock data as needed
];

const mockVideos = [
    {
        id: "v1",
        title: "Creator Update #1",
        thumbnail: "/svgs/buck.svg",
        creator: { name: "Alice Creator", email: "alice@creator.com", warningCount: 2 },
        flagged: true
    },
    {
        id: "v2",
        title: "Behind the Scenes",
        thumbnail: "/svgs/buck-dark.svg",
        creator: { name: "Bob Maker", email: "bob@maker.com", warningCount: 0 },
        flagged: true
    }
];

export default function ModerationPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Content moderation state
    const [videos] = useState<any[]>(mockVideos);
    const [warnDialogOpen, setWarnDialogOpen] = useState(false);
    const [warnTarget, setWarnTarget] = useState<{ name: string; email: string } | null>(null);
    const [customWarnMessage, setCustomWarnMessage] = useState("");

    // Tabs state (use provided styles and controlled Tabs)
    const [activeTab, setActiveTab] = useState<string>("messages");
    const handleTabChange = (value: string) => setActiveTab(value);

    // Set page title
    useEffect(() => {
        document.title = "Buck | Admin Moderation ";
    }, []);

    // Simulate data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setMessages(mockMessages);
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleBadWordClick = (word: string) => {
        if (!activeFilters.includes(word)) {
            setActiveFilters([...activeFilters, word]);
        }
    };

    const applyAllFilters = () => {
        setActiveFilters([...badWordsFilters]);
    };

    const removeFilter = (word: string) => {
        setActiveFilters(activeFilters.filter(f => f !== word));
    };

    const clearAllFilters = () => {
        setActiveFilters([]);
        setSearchQuery("");
    };

    const handleViewMessage = (message: any) => {
        setSelectedMessage(message);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTimeout(() => setSelectedMessage(null), 200);
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getWarningColor = (count: number) => {
        if (count >= 5) return "text-red-500 bg-red-500/10";
        if (count >= 3) return "text-orange-500 bg-orange-500/10";
        if (count >= 1) return "text-yellow-500 bg-yellow-500/10";
        return "text-green-500 bg-green-500/10";
    };

    const filteredMessages = messages.filter(message => {
        const matchesSearch = searchQuery === "" ||
            message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.sender.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilters = activeFilters.length === 0 ||
            activeFilters.some(filter =>
                message.content.toLowerCase().includes(filter.toLowerCase())
            );

        return matchesSearch && matchesFilters;
    });

    const openWarnDialog = (target: { name: string; email: string }) => {
        setWarnTarget(target);
        setCustomWarnMessage("");
        setWarnDialogOpen(true);
    };

    const closeWarnDialog = () => {
        setWarnDialogOpen(false);
        setWarnTarget(null);
        setCustomWarnMessage("");
    };

    const sendWarning = () => {
        // TODO: Integrate API to send warning with customWarnMessage
        console.log("Warn", warnTarget, customWarnMessage);
        closeWarnDialog();
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldBan className="w-8 h-8 text-red-500 font-bold" />
                    <h1 className="text-2xl font-bold text-foreground mt-2">Content Moderation</h1>
                </div>
                <p className="text-muted-foreground">Manage creators and members</p>
            </div>

            <ModerationTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                messagesContent={(
                    <>
                        <MessageFilters
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            activeFilters={activeFilters}
                            badWordsFilters={badWordsFilters}
                            onApplyAll={applyAllFilters}
                            onClearAll={clearAllFilters}
                            onAddFilter={handleBadWordClick}
                            onRemoveFilter={removeFilter}
                        />
                        <FlaggedMessagesTable
                            isLoading={isLoading}
                            messages={messages as any}
                            filteredMessages={filteredMessages as any}
                            formatTimestamp={formatTimestamp}
                            getWarningColor={getWarningColor}
                            onView={handleViewMessage}
                            onWarn={(m) => openWarnDialog({ name: m.sender.name, email: m.sender.email })}
                        />

                        {/* Message Detail Dialog */}
                        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl">Message Details</DialogTitle>
                                </DialogHeader>

                                {selectedMessage && (
                                    <div className="space-y-6">
                                        {/* Message Content */}
                                        <div className="p-4 bg-muted/50 rounded-lg border border-border/20">
                                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Message Content</h3>
                                            <p className="text-foreground">{selectedMessage.content}</p>
                                        </div>

                                        {/* Sender Information */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-card rounded-lg border border-border/30">
                                                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Sender Name</h3>
                                                <p className="text-foreground font-medium">{selectedMessage.sender.name}</p>
                                            </div>
                                            <div className="p-4 bg-card rounded-lg border border-border/30">
                                                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Email</h3>
                                                <p className="text-foreground">{selectedMessage.sender.email}</p>
                                            </div>
                                        </div>

                                        {/* Warning Count */}
                                        <div className="p-4 bg-card rounded-lg border border-border/30">
                                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Warning Status</h3>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center ${getWarningColor(selectedMessage.sender.warningCount)}`}>
                                                    {selectedMessage.sender.warningCount} {selectedMessage.sender.warningCount === 1 ? 'warning' : 'warnings'}
                                                </div>
                                                {selectedMessage.sender.warningCount >= 5 && (
                                                    <div className="text-sm text-red-500 font-medium">⚠️ User may need suspension</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timestamp */}
                                        <div className="p-4 bg-muted/30 rounded-lg border border-border/20">
                                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Timestamp</h3>
                                            <p className="text-foreground">{formatTimestamp(selectedMessage.timestamp)}</p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/20">
                                            <Button variant="outline" onClick={handleCloseDialog}>
                                                Close
                                            </Button>
                                            <Button variant="destructive" onClick={() => openWarnDialog({ name: selectedMessage.sender.name, email: selectedMessage.sender.email })}>
                                                <Ban className="w-4 h-4 mr-2" />
                                                Issue Warning
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </>
                )}
                contentGrid={(
                    <ContentGrid
                        videos={videos as any}
                        onWarn={(v) => openWarnDialog({ name: v.creator.name, email: v.creator.email })}
                    />
                )}
            />

            {/* Warn Dialog with custom message */}
            <Dialog open={warnDialogOpen} onOpenChange={closeWarnDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Issue Warning</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {warnTarget && (
                            <div className="text-sm text-muted-foreground">
                                Sending warning to <span className="font-medium text-foreground">{warnTarget.name}</span> ({warnTarget.email})
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-white">Custom Message</label>
                            <textarea
                                className="w-full dark:text-white dark:placeholder:text-white rounded-md border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                                rows={5}
                                placeholder="Describe the violation and the necessary action..."
                                value={customWarnMessage}
                                onChange={(e) => setCustomWarnMessage(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={closeWarnDialog}>Cancel</Button>
                            <Button variant="destructive" onClick={sendWarning}>Send Warning</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}