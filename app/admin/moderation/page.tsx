"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ban, ShieldBan } from "lucide-react";
import { ModerationTabs } from "@/components/admin/ModerationTabs";
import { MessageFilters } from "@/components/admin/MessageFilters";
import { FlaggedMessagesTable } from "@/components/admin/FlaggedMessagesTable";
import { ContentGrid } from "@/components/admin/ContentGrid";
import { adminService, type FlaggedMessage, type FlaggedContent } from "@/services/admin";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import { getSignedStreamUrl } from "@/app/actions/s3-signed-url";

const badWordsFilters = [
    "fuck", "fucking", "motherfucker", "shit", "bitch", "asshole",
    "bastard", "son of a bitch", "dickhead", "crackhead", "douchebag",
    "cunt", "slut", "whore", "pussy", "nigger"
];

export default function ModerationPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [messages, setMessages] = useState<FlaggedMessage[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<FlaggedMessage | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Content moderation state
    const [videos, setVideos] = useState<FlaggedContent[]>([]);
    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const [warnDialogOpen, setWarnDialogOpen] = useState(false);
    const [warnTarget, setWarnTarget] = useState<{
        id: string;
        name: string;
        email: string;
        violatingContent?: string;
    } | null>(null);
    const [customWarnMessage, setCustomWarnMessage] = useState("");
    const [isWarning, setIsWarning] = useState(false);

    // Pagination state
    const [messagePage, setMessagePage] = useState(1);
    const [contentPage, setContentPage] = useState(1);
    const [messagePagination, setMessagePagination] = useState({ total: 0, totalPages: 0 });
    const [contentPagination, setContentPagination] = useState({ total: 0, totalPages: 0 });

    // Tabs state
    const [activeTab, setActiveTab] = useState<string>("messages");
    const handleTabChange = (value: string) => setActiveTab(value);

    // Set page title
    useEffect(() => {
        document.title = "Buck | Admin Moderation";
    }, []);

    // Fetch flagged messages
    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const response = await adminService.getFlaggedMessages({
                page: messagePage,
                limit: 10,
                search: searchQuery || undefined,
                badWords: activeFilters.length > 0 ? activeFilters : undefined,
            });

            if (response.success) {
                setMessages(response.data.messages);
                setMessagePagination({
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages,
                });
            }
        } catch (error: any) {
            console.error('Failed to fetch messages:', error);
            toast.error(error.message || 'Failed to load flagged messages');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch flagged content
    const fetchContent = async () => {
        setIsLoadingContent(true);
        try {
            const response = await adminService.getFlaggedContent({
                page: contentPage,
                limit: 10,
            });

            if (response.success) {
                // Sign the S3 URLs for playback
                const signedContent = await Promise.all(response.data.content.map(async (item) => {
                    if (item.streamUrl) {
                        try {
                            const signedUrl = await getSignedStreamUrl(item.streamUrl);
                            return { ...item, streamUrl: signedUrl };
                        } catch (e) {
                            console.error("Failed to sign url for item", item.id, e);
                            return item;
                        }
                    }
                    return item;
                }));

                setVideos(signedContent);
                setContentPagination({
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages,
                });
            }
        } catch (error: any) {
            console.error('Failed to fetch content:', error);
            toast.error(error.message || 'Failed to load flagged content');
        } finally {
            setIsLoadingContent(false);
        }
    };

    // Fetch messages when filters change
    useEffect(() => {
        if (activeTab === "messages") {
            fetchMessages();
        }
    }, [messagePage, searchQuery, activeFilters, activeTab]);

    // Fetch content when tab changes
    useEffect(() => {
        if (activeTab === "content") {
            fetchContent();
        }
    }, [contentPage, activeTab]);

    const handleBadWordClick = (word: string) => {
        if (!activeFilters.includes(word)) {
            setActiveFilters([...activeFilters, word]);
            setMessagePage(1); // Reset to first page
        }
    };

    const applyAllFilters = () => {
        setActiveFilters([...badWordsFilters]);
        setMessagePage(1);
    };

    const removeFilter = (word: string) => {
        setActiveFilters(activeFilters.filter(f => f !== word));
        setMessagePage(1);
    };

    const clearAllFilters = () => {
        setActiveFilters([]);
        setSearchQuery("");
        setMessagePage(1);
    };

    const handleViewMessage = (message: FlaggedMessage) => {
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

    const openWarnDialog = (target: {
        id: string;
        name: string;
        email: string;
        violatingContent?: string;
    }) => {
        setWarnTarget(target);
        setCustomWarnMessage("");
        setWarnDialogOpen(true);
    };

    const closeWarnDialog = () => {
        setWarnDialogOpen(false);
        setWarnTarget(null);
        setCustomWarnMessage("");
    };

    const sendWarning = async () => {
        if (!warnTarget) {
            toast.error("Please enter a warning message");
            return;
        }

        setIsWarning(true);
        try {
            const response = await adminService.issueWarning({
                userId: warnTarget.id,
                warningMessage: customWarnMessage,
                violatingContent: warnTarget.violatingContent,
            });

            if (response.success) {
                toast.success(`Warning sent to ${warnTarget.name}. Total warnings: ${response.data.isWarnedTimes}`);
                closeWarnDialog();

                // Refresh data
                if (activeTab === "messages") {
                    fetchMessages();
                } else {
                    fetchContent();
                }
            }
        } catch (error: any) {
            console.error('Failed to send warning:', error);
            toast.error(error.message || 'Failed to send warning');
        } finally {
            setIsWarning(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldBan className="w-8 h-8 text-red-500 font-bold" />
                    <h1 className="text-2xl font-bold text-foreground mt-2">Content Moderation</h1>
                </div>
                <p className="text-muted-foreground">Manage flagged messages and content</p>
            </div>

            <ModerationTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                messagesContent={(
                    <>
                        <MessageFilters
                            searchQuery={searchQuery}
                            onSearchChange={(value) => {
                                setSearchQuery(value);
                                setMessagePage(1);
                            }}
                            activeFilters={activeFilters}
                            badWordsFilters={badWordsFilters}
                            onApplyAll={applyAllFilters}
                            onClearAll={clearAllFilters}
                            onAddFilter={handleBadWordClick}
                            onRemoveFilter={removeFilter}
                        />

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader />
                            </div>
                        ) : (
                            <>
                                <FlaggedMessagesTable
                                    isLoading={isLoading}
                                    messages={messages}
                                    filteredMessages={messages}
                                    formatTimestamp={formatTimestamp}
                                    getWarningColor={getWarningColor}
                                    onView={handleViewMessage}
                                    onWarn={(m) => {
                                        openWarnDialog({
                                            id: m.sender.id,
                                            name: m.sender.name,
                                            email: m.sender.email,
                                            violatingContent: m.content,
                                        });
                                    }}
                                    pagination={messagePagination}
                                    currentPage={messagePage}
                                    onPageChange={setMessagePage}
                                />

                                {/* Pagination at bottom */}
                                {messagePagination.totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={messagePage === 1}
                                            onClick={() => setMessagePage(p => p - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {messagePage} of {messagePagination.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={messagePage === messagePagination.totalPages}
                                            onClick={() => setMessagePage(p => p + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Message Detail Dialog */}
                        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 rounded-lg shadow-2xl">
                                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/20">
                                    <DialogTitle className="text-2xl font-bold">Message Details</DialogTitle>
                                </DialogHeader>

                                {selectedMessage && (
                                    <>
                                        {/* Scrollable Content */}
                                        <div className="overflow-y-auto px-6 py-4 space-y-5 flex-1 custom-scrollbar">
                                            {/* Message Content */}
                                            <div className="p-5 bg-muted/50 rounded-xl border border-border/20 shadow-sm">
                                                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Message Content</h3>
                                                <p className="text-foreground leading-relaxed text-base">{selectedMessage.content}</p>
                                            </div>

                                            {/* Stream Title */}
                                            <div className="p-5 rounded-xl border border-border/20 shadow-sm">
                                                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Stream</h3>
                                                <p className="text-foreground font-semibold text-base">{selectedMessage.streamTitle}</p>
                                            </div>

                                            {/* Sender Information */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-5 bg-card rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                                                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Sender Name</h3>
                                                    <p className="text-foreground font-semibold text-base">{selectedMessage.sender.name}</p>
                                                </div>
                                                <div className="p-5 bg-card rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                                                    <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Email</h3>
                                                    <p className="text-foreground text-base">{selectedMessage.sender.email}</p>
                                                </div>
                                            </div>

                                            {/* Reporter Comment */}
                                            <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl border border-amber-300/50 dark:border-amber-700/50 shadow-sm">
                                                <h3 className="text-xs font-bold uppercase tracking-wide text-amber-900 dark:text-amber-100 mb-3">Reporter Comment</h3>
                                                <p className="text-amber-900 dark:text-amber-200 leading-relaxed text-base">{selectedMessage.reporterComment}</p>
                                            </div>

                                            {/* Warning Count */}
                                            <div className="p-5 bg-card rounded-xl border border-border/30 shadow-sm">
                                                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Warning Status</h3>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <div className={`px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center shadow-sm ${getWarningColor(selectedMessage.sender.warningCount)}`}>
                                                        {selectedMessage.sender.warningCount} {selectedMessage.sender.warningCount === 1 ? 'warning' : 'warnings'}
                                                    </div>
                                                    {selectedMessage.sender.warningCount >= 5 && (
                                                        <div className="text-sm text-red-500 font-semibold flex items-center gap-1.5">
                                                            <span className="text-lg">⚠️</span>
                                                            <span>User may need suspension</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Timestamp */}
                                            <div className="p-5 bg-muted/30 rounded-xl border border-border/20 shadow-sm">
                                                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Timestamp</h3>
                                                <p className="text-foreground font-medium text-base">{formatTimestamp(selectedMessage.timestamp)}</p>
                                            </div>
                                        </div>

                                        {/* Fixed Action Buttons */}
                                        <div className="px-6 py-4 border-t border-border/20 bg-muted/30 flex items-center justify-end gap-3">
                                            <Button variant="outline" onClick={handleCloseDialog} className="min-w-[100px]">
                                                Close
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    openWarnDialog({
                                                        id: selectedMessage.sender.id,
                                                        name: selectedMessage.sender.name,
                                                        email: selectedMessage.sender.email,
                                                        violatingContent: selectedMessage.content,
                                                    });
                                                    handleCloseDialog();
                                                }}
                                                className="min-w-[140px]"
                                            >
                                                <Ban className="w-4 h-4 mr-2" />
                                                Issue Warning
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    </>
                )}
                contentGrid={(
                    <>
                        {/* Pagination at top */}
                        {!isLoadingContent && contentPagination.totalPages > 1 && (
                            <div className="flex items-center justify-end gap-2 mb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={contentPage === 1}
                                    onClick={() => setContentPage(p => p - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {contentPage} of {contentPagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={contentPage === contentPagination.totalPages}
                                    onClick={() => setContentPage(p => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}

                        {isLoadingContent ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader />
                            </div>
                        ) : (
                            <>
                                <ContentGrid
                                    videos={videos}
                                    onWarn={(v) => openWarnDialog({
                                        id: v.creator.id,
                                        name: v.creator.name,
                                        email: v.creator.email,
                                        violatingContent: `Stream: "${v.title}" (${v.workoutType}) - Reporter Comment: ${v.reporterComment}`,
                                    })}
                                    getWarningColor={getWarningColor}
                                />

                                {/* Pagination at bottom */}
                                {contentPagination.totalPages > 1 && (
                                    <div className="flex items-center justify-end gap-2 mt-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={contentPage === 1}
                                            onClick={() => setContentPage(p => p - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {contentPage} of {contentPagination.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={contentPage === contentPagination.totalPages}
                                            onClick={() => setContentPage(p => p + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
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
                            <>
                                <div className="text-sm text-muted-foreground">
                                    Sending warning to <span className="font-medium text-foreground">{warnTarget.name}</span> ({warnTarget.email})
                                </div>

                                {/* Display violating content */}
                                {warnTarget.violatingContent && (
                                    <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
                                        <p className="text-xs font-semibold text-red-500 mb-2">Violating Content:</p>
                                        <p className="text-sm text-foreground">{warnTarget.violatingContent}</p>
                                    </div>
                                )}
                            </>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-white">Custom Message</label>
                            <textarea
                                className="w-full dark:text-white dark:placeholder:text-white rounded-md border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                                rows={5}
                                placeholder="Optional: Describe the violation and the necessary action..."
                                value={customWarnMessage}
                                onChange={(e) => setCustomWarnMessage(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={closeWarnDialog} disabled={isWarning}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={sendWarning}
                                disabled={isWarning}
                            >
                                {isWarning ? "Sending..." : "Send Warning"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}