"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    AlertTriangle,
    Shield,
    Eye,
    Ban,
    Filter,
    X,
    ShieldBan
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";

// Bad words quick filters
const badWordsFilters = [
    "fuck",
    "fucking",
    "motherfucker",
    "shit",
    "bitch",
    "asshole",
    "bastard",
    "son of a bitch",
    "dickhead",
    "crackhead",
    "douchebag",
    "cunt",
    "slut",
    "whore",
    "pussy",
    "nigger",
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

export default function ModerationPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

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

            {/* Search and Filters Section */}
            <div className="bg-card rounded-lg border border-border/30 shadow-sm p-6 mb-6">
                {/* Search Bar */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Search Messages
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by message content, sender name, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Filter Buttons */}
                <div>
                    <div className="flex items-center justify-between my-3">
                        <div className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            <p className="mt-1">Quick Filters</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {activeFilters.length < badWordsFilters.length && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={applyAllFilters}
                                    className="text-xs"
                                >
                                    Apply All
                                </Button>
                            )}
                            {activeFilters.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="text-xs"
                                >
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {badWordsFilters.map((word) => {
                            const isActive = activeFilters.includes(word);
                            return (
                                <button
                                    key={word}
                                    onClick={() => handleBadWordClick(word)}
                                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? "bg-red-500 text-white shadow-md"
                                        : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                        }`}
                                >
                                    {word}
                                    {isActive && (
                                        <X
                                            className="inline-block ml-1 w-3 h-3"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFilter(word);
                                            }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Active Filters Display */}
                {activeFilters.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/20 cursor-pointer">
                        <p className="text-xs text-muted-foreground mb-2">Active Filters:</p>
                        <div className="flex flex-wrap gap-2">
                            {activeFilters.map((filter) => (
                                <div
                                    key={filter}
                                    className=" px-2 py-1 bg-primary/10 text-primary text-xs rounded-md flex items-center gap-1"
                                >
                                    <p className="mt-1">{filter}</p>
                                    <button
                                        onClick={() => removeFilter(filter)}
                                        className="hover:text-primary/70"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Messages Table */}
            <div className="bg-card rounded-lg border border-border/30 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border/20">
                    <div className="flex items-center justify-between">
                        <div className=" text-lg font-semibold text-foreground flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5  text-orange-500" />
                            <p className="pt-1.5"> Flagged Messages</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {isLoading ? "Loading..." : `${filteredMessages.length} message(s) found`}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Message Preview
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Sender
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Warnings
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {isLoading ? (
                                // Skeleton Loading State
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="h-4 bg-primary/10 animate-pulse rounded w-3/4"></div>
                                                <div className="h-3 bg-primary/10 animate-pulse rounded w-1/2"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-primary/10 animate-pulse rounded w-32"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-primary/10 animate-pulse rounded w-40"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 w-16 bg-primary/10 animate-pulse rounded-full"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-primary/10 animate-pulse rounded w-28"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <div className="h-8 w-20 bg-primary/10 animate-pulse rounded"></div>
                                                <div className="h-8 w-20 bg-primary/10 animate-pulse rounded"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredMessages.length === 0 ? (
                                // No Results State
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Shield className="w-12 h-12 text-muted-foreground mb-3" />
                                            <p className="text-muted-foreground font-medium">No messages found</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {searchQuery || activeFilters.length > 0
                                                    ? "Try adjusting your search or filters"
                                                    : "All messages are clean!"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                // Actual Data
                                filteredMessages.map((message) => (
                                    <tr key={message.id} className="hover:bg-accent/50 transition-colors">
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                                <p className="mt-2 text-sm text-foreground line-clamp-2">
                                                    {message.content}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-foreground">{message.sender.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-muted-foreground">{message.sender.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`px-3 border-2 min-w-[90px] py-1 rounded-full text-xs font-bold inline-flex items-center ${getWarningColor(message.sender.warningCount)}`}>
                                                {message.sender.warningCount} {message.sender.warningCount === 1 ? 'warning' : 'warnings'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-muted-foreground">
                                                {formatTimestamp(message.timestamp)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center "
                                                    onClick={() => handleViewMessage(message)}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    <p className="mt-1">View</p>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    <Ban className="w-4 h-4 mr-1" />
                                                    <p className="mt-1"> Warn</p>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                                <Button variant="destructive">
                                    <Ban className="w-4 h-4 mr-2" />
                                    Issue Warning
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
