"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { Calendar as CalendarIcon, Dumbbell } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface ScheduleStreamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSchedule: (data: ScheduleStreamData) => Promise<void>;
}

export interface ScheduleStreamData {
    title: string;
    workoutType: string;
    startTime: string;
    timezone: string;
}



export default function ScheduleStreamDialog({
    open,
    onOpenChange,
    onSchedule,
}: ScheduleStreamDialogProps) {
    const [title, setTitle] = useState("");
    const [workoutType, setWorkoutType] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            setTitle("");
            setWorkoutType("");
            setSelectedDate(undefined);
            setSelectedTime("");
            setIsSubmitting(false);
            setDatePickerOpen(false);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !workoutType || !selectedDate || !selectedTime) return;

        setIsSubmitting(true);

        try {
            // Create local datetime and convert to ISO
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const localDateTime = new Date(`${dateStr}T${selectedTime}:00`);
            const startTime = localDateTime.toISOString();

            await onSchedule({
                title,
                workoutType,
                startTime,
                timezone,
            });

            // Reset form
            setTitle("");
            setWorkoutType("");
            setSelectedDate(undefined);
            setSelectedTime("");
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to schedule stream:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        Schedule Live Stream
                    </DialogTitle>
                    <DialogDescription>
                        Set up your upcoming live stream. Your followers will be notified.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Stream Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Morning HIIT Session"
                            required
                        />
                    </div>

                    <div className="space-y-2 dark:text-white">
                        <Label htmlFor="workoutType" className="flex items-center gap-2">
                            <Dumbbell className="w-4 h-4" />
                            Workout Type *
                        </Label>
                        <Select value={workoutType} onValueChange={setWorkoutType} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select workout type" className="" />
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                Date *
                            </Label>
                            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full h-11 justify-start text-left font-normal",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                    >
                                        {selectedDate ? (
                                            format(selectedDate, "MMM d, yyyy")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto min-w-[320px] p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => {
                                            setSelectedDate(date);
                                            setDatePickerOpen(false);
                                        }}
                                        disabled={(date) => date < today}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                Time *
                            </Label>
                            <TimePicker
                                value={selectedTime}
                                onChange={setSelectedTime}
                                placeholder="Pick a time"
                            />
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        <strong>Timezone:</strong> {timezone}
                        <p className="mt-1 text-xs">
                            Your subscribers will be notified of this scheduled live stream and will see the time in their local timezone.
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Scheduling..." : "Schedule Stream"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
