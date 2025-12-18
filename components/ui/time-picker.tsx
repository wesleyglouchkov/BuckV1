"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { ScrollArea } from "./scroll-area"

interface TimePickerProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function TimePicker({
    value,
    onChange,
    placeholder = "Pick a time",
    className,
}: TimePickerProps) {
    const [open, setOpen] = React.useState(false)

    // Parse current value
    const parseTime = (timeStr: string) => {
        if (!timeStr) return { hour: 9, minute: 0, period: "AM" }
        const [h, m] = timeStr.split(":")
        const hour = parseInt(h, 10)
        const minute = parseInt(m, 10)
        return {
            hour: hour === 0 ? 12 : hour > 12 ? hour - 12 : hour,
            minute,
            period: hour >= 12 ? "PM" : "AM",
        }
    }

    const { hour, minute, period } = parseTime(value)

    const hours = Array.from({ length: 12 }, (_, i) => i + 1)
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
    const periods = ["AM", "PM"]

    const formatTime = (h: number, m: number, p: string) => {
        let hour24 = h
        if (p === "PM" && h !== 12) hour24 = h + 12
        if (p === "AM" && h === 12) hour24 = 0
        return `${hour24.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    }

    const handleSelect = (type: "hour" | "minute" | "period", val: number | string) => {
        let newHour = hour
        let newMinute = minute
        let newPeriod = period

        if (type === "hour") newHour = val as number
        if (type === "minute") newMinute = val as number
        if (type === "period") newPeriod = val as string

        onChange(formatTime(newHour, newMinute, newPeriod))
    }

    const displayValue = value
        ? `${hour}:${minute.toString().padStart(2, "0")} ${period}`
        : null

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full h-11 justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {displayValue || <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex divide-x divide-border">
                    {/* Hours */}
                    <ScrollArea className="h-60 w-20">
                        <div className="p-2">
                            <p className="text-xs font-medium text-muted-foreground text-center mb-2">Hour</p>
                            {hours.map((h) => (
                                <button
                                    key={h}
                                    onClick={() => handleSelect("hour", h)}
                                    className={cn(
                                        "w-full py-2 px-3 text-sm  transition-colors",
                                        hour === h
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-foreground"
                                    )}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Minutes */}
                    <ScrollArea className="h-60 w-20">
                        <div className="p-2">
                            <p className="text-xs font-medium text-muted-foreground text-center mb-2">Min</p>
                            {minutes.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => handleSelect("minute", m)}
                                    className={cn(
                                        "w-full py-2 px-3 text-sm  transition-colors",
                                        minute === m
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted text-foreground"
                                    )}
                                >
                                    {m.toString().padStart(2, "0")}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* AM/PM */}
                    <div className="p-2 w-20">
                        <p className="text-xs font-medium text-muted-foreground text-center mb-2">Period</p>
                        {periods.map((p) => (
                            <button
                                key={p}
                                onClick={() => handleSelect("period", p)}
                                className={cn(
                                    "w-full py-2 px-3 text-sm  transition-colors",
                                    period === p
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted text-foreground"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
