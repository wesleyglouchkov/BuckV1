"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants/categories";

interface StreamSetupCardProps {
    title: string;
    onTitleChange: (value: string) => void;
    type: string;
    onTypeChange: (value: string) => void;
}

export default function StreamSetupCard({
    title,
    onTitleChange,
    type,
    onTypeChange,
}: StreamSetupCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Stream Setup</CardTitle>
                {(!title.trim() || !type.trim()) && (
                    <p className="text-xs text-muted-foreground">
                        * Please fill in both fields to enable Go Live
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="streamTitle">Title</Label>
                    <Input
                        id="streamTitle"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="Enter your stream title"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="streamType">Stream Type</Label>
                    <Select
                        value={type}
                        onValueChange={onTypeChange}
                    >
                        <SelectTrigger className="h-12 border border-border">
                            <SelectValue placeholder="Select workout type" />
                        </SelectTrigger>
                        <SelectContent className="border border-border">
                            {CATEGORIES.map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
