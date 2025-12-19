"use client";

import { Calendar, dateFnsLocalizer, Event, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface StreamEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    workoutType?: string;
    thumbnail?: string;
    isLive?: boolean;
    replayUrl?: string;
  };
}

interface StreamCalendarProps {
  events: StreamEvent[];
  onSelectEvent?: (event: StreamEvent) => void;
}

export default function StreamCalendar({ events, onSelectEvent }: StreamCalendarProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleSelectEvent = (event: StreamEvent) => {
    if (onSelectEvent) {
      onSelectEvent(event);
    } else {
      router.push(`/creator/live/${event.id}`);
    }
  };

  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  const handleNavigate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Custom event styling
  const eventStyleGetter = (event: StreamEvent) => {
    const isLive = event.resource?.isLive;
    const isPast = event.start < new Date();

    // Determine background color based on event state
    let backgroundColor = "var(--primary)";
    if (isLive) {
      backgroundColor = "var(--destructive)";
    } else if (isPast) {
      backgroundColor = "var(--muted-foreground)";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        border: "none",
        color: isPast ? "var(--muted)" : "var(--primary-foreground)",
        fontWeight: 500,
        fontSize: "12px",
        padding: "2px 6px",
        opacity: isPast ? 0.6 : 1,
      },
    };
  };

  return (
    <div className="h-[600px] bg-card p-6 rounded-xl border border-border">
      <style jsx global>{`
        .rbc-calendar {
          font-family: var(--font-sans);
          color: var(--foreground);
        }
        .rbc-header {
          padding: 12px 0;
          font-weight: 600;
          color: var(--foreground);
          background: color-mix(in srgb, var(--muted) 30%, transparent);
          border-color: var(--border) !important;
        }
        .rbc-header span {
          color: var(--foreground);
        }
        .rbc-month-view,
        .rbc-time-view,
        .rbc-agenda-view {
          border-color: var(--border) !important;
          background: var(--card);
        }
        .rbc-month-row {
          border-color: var(--border) !important;
        }
        .rbc-day-bg {
          border-color: var(--border) !important;
        }
        .rbc-off-range-bg {
          background: color-mix(in srgb, var(--muted) 20%, transparent);
        }
        .rbc-today {
          background: color-mix(in srgb, var(--primary) 10%, transparent) !important;
        }
        .rbc-toolbar {
          margin-bottom: 20px;
          gap: 10px;
          flex-wrap: wrap;
        }
        .rbc-toolbar-label {
          color: var(--foreground);
          font-weight: 600;
          font-size: 1.1rem;
        }
        .rbc-toolbar button {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--foreground);
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
        }
        .rbc-toolbar button:hover {
          background: var(--muted);
          color: var(--foreground);
        }
        .rbc-toolbar button:focus {
          outline: none;
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 30%, transparent) !important;
        }
        .rbc-toolbar button.rbc-active {
          background: var(--primary) !important;
          color: var(--primary-foreground) !important;
          border-color: var(--primary) !important;
        }
        .rbc-toolbar button.rbc-active:hover {
          background: color-mix(in srgb, var(--primary) 90%, transparent) !important;
        }
        .rbc-btn-group {
          display: flex;
          gap: 4px;
        }
        .rbc-btn-group button {
          margin: 0;
        }
        .rbc-btn-group button:first-child {
          border-radius: 8px 0 0 8px;
        }
        .rbc-btn-group button:last-child {
          border-radius: 0 8px 8px 0;
        }
        .rbc-btn-group button:only-child {
          border-radius: 8px;
        }
        .rbc-event {
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          background-color: var(--primary) !important;
          border: none !important;
          color: var(--primary-foreground) !important;
          margin-top: 4px !important;
          margin-bottom: 6px !important;
          border-radius: 0px !important;
        }
        .rbc-event:hover {
          opacity: 0.9;
          transform: scale(1.005);
          transition: all 0.5s;
        }
        .rbc-event-content {
          color: var(--primary-foreground);
          font-weight: 500;
          font-size: 12px;
          background-color: var(--primary) !important;
          padding: 4px 6px;
        }
        .rbc-show-more {
          color: var(--primary) !important;
          font-weight: 500;
          background: transparent;
          cursor: pointer;
        }
        .rbc-show-more:hover {
          text-decoration: underline;
        }
        /* Date cells - white text in dark mode */
        .rbc-date-cell {
          padding: 4px 8px;
          text-align: right;
        }
        .rbc-date-cell button,
        .rbc-date-cell a,
        .rbc-date-cell > a,
        .rbc-button-link {
          color: var(--foreground);
          background: transparent;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }
        .rbc-date-cell.rbc-off-range button,
        .rbc-date-cell.rbc-off-range a {
          color: var(--muted-foreground);
        }
        .rbc-date-cell.rbc-now button,
        .rbc-date-cell.rbc-current button {
          color: var(--primary) !important;
          font-weight: 700;
        }
        /* Time view styles */
        .rbc-time-header {
          border-color: var(--border) !important;
        }
        .rbc-time-content {
          border-color: var(--border) !important;
        }
        .rbc-time-slot {
          border-color: var(--border) !important;
        }
        .rbc-timeslot-group {
          border-color: var(--border) !important;
        }
        .rbc-time-gutter .rbc-label {
          color: var(--muted-foreground);
          font-size: 11px;
        }
        .rbc-current-time-indicator {
          background-color: var(--primary) !important;
        }
        .rbc-allday-cell {
          border-color: var(--border) !important;
        }
        .rbc-day-slot .rbc-time-slot {
          border-color: color-mix(in srgb, var(--border) 50%, transparent) !important;
        }
        /* Row content */
        .rbc-row-content {
          z-index: 1;
        }
        /* Overlay for popup */
        .rbc-overlay {
          background: color-mix(in srgb, var(--popover) 80%, transparent);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
          box-shadow: 
            0 4px 24px color-mix(in srgb, var(--foreground) 10%, transparent),
            0 1px 2px color-mix(in srgb, var(--foreground) 5%, transparent),
            inset 0 1px 0 color-mix(in srgb, var(--background) 20%, transparent);
          padding: 12px;
        }
        .rbc-overlay-header {
          color: var(--foreground);
          font-weight: 600;
          padding: 4px 8px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 4px;
          margin-top: 4px;
          margin-left: 4px;
        }
      `}</style>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        style={{ height: "100%" }}
        views={["month", "week", "day"]}
        view={currentView}
        onView={handleViewChange}
        date={currentDate}
        onNavigate={handleNavigate}
        popup
        selectable
      />
    </div>
  );
}
