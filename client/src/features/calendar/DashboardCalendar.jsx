import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// FullCalendar + plugins (day grid + click interactions)
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import "./dashboardCalendarPage.css"

export default function DashboardCalendar() {
    // Grab tasks from Redux so this calendar stays in sync with the app
    const tasks = useSelector((s) => s.tasks.tasks);

    // React Router helper for navigating to other pages
    const nav = useNavigate();

    // Convert progress number into a friendly status label
    const statusFromProgress = (p = 0) =>
        p >= 100 ? "Complete" : p > 0 ? "Ongoing" : "Todo";

    // Convert progress into a colour (quick visual scanning in calendar)
    const colorFromProgress = (p = 0) => {
        if (p >= 100) return "#16a34a"; // green
        if (p > 0) return "#f59e0b"; // amber
        return "#2563eb"; // blue
    };

    // Build calendar events from tasks.
    // useMemo prevents re-building on every render unless tasks changes.
    const events = useMemo(() => {
        return tasks
            // Only tasks with a due date can appear on a calendar
            .filter((t) => t.due_date)
            .map((t) => {
                const bg = colorFromProgress(t.progress);

                return {
                    // FullCalendar expects string IDs
                    id: String(t.id),

                    // Text shown on each event
                    title: t.title,

                    // Use YYYY-MM-DD for all-day events
                    start: t.due_date.slice(0, 10),

                    // Tasks here are treated as all-day items
                    allDay: true,

                    // Apply progress-based colour
                    backgroundColor: bg,
                    borderColor: bg,

                    // Extra info we might want later (click handlers, tooltips, etc.)
                    extendedProps: {
                        task: t,
                        status: statusFromProgress(t.progress),
                    },
                };
            });
    }, [tasks]);

    return (
        <div className="calendar-card">
            <h2>Calendar <button onClick={() => nav("/calendar")}>Open Calendar</button></h2>

            <FullCalendar
                // Enable month-style grid + click support
                plugins={[dayGridPlugin, interactionPlugin]}

                // Custom default view (2 weeks)
                initialView="twoWeek"

                // Define the custom view config
                views={{
                    twoWeek: { type: "dayGrid", duration: { weeks: 2 } },
                }}

                // Monday as first day of week (UK-friendly)
                firstDay={1}

                // Hide the built-in header (we have our own title/button)
                headerToolbar={false}

                // Let calendar size itself based on content
                height="auto"

                // Don't force a 6-week layout (keeps dashboard compact)
                fixedWeekCount={false}

                // Hide "greyed out" days from previous/next month
                showNonCurrentDates={false}

                // Events created from Redux tasks
                events={events}

                // Render events as blocks (better for small dashboard cards)
                eventDisplay="block"

                // Limit events per day before "+ more" appears
                dayMaxEventRows={2}

                // Clicking a date or event takes user to the full calendar
                dateClick={() => nav("/calendar")}
                eventClick={() => nav("/calendar")}
            />
        </div>
    );
}