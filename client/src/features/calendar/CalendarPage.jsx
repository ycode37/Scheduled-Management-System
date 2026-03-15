import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

// FullCalendar + plugins (month/week/day views + click interactions)
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import "./calendarPage.css";

export default function CalendarPage() {
  // Pull tasks from Redux store (keeps UI in sync with the rest of the app)
  const tasks = useSelector((state) => state.tasks.tasks);

  // Track which event is "expanded" (to show extra details)
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Convert a progress number into a simple status label for display
  const statusFromProgress = (p = 0) =>
    p >= 100 ? "Complete" : p > 0 ? "Ongoing" : "Todo";

  // Convert progress into a colour so the calendar is visually scannable
  // (Complete = green, in progress = amber, not started = blue)
  const colorFromProgress = (p = 0) => {
    if (p >= 100) return "#16a34a"; // green
    if (p > 0) return "#f59e0b"; // amber
    return "#2563eb"; // blue
  };

  // Build calendar events from tasks.
  // useMemo avoids rebuilding the list every render unless tasks changes.
  const events = useMemo(() => {
    return (
      tasks
        // Only show tasks that actually have a due date
        .filter((t) => t.due_date)
        .map((t) => {
          const bg = colorFromProgress(t.progress);

          return {
            // FullCalendar expects ids to be strings
            id: String(t.id),

            // Title shown on the calendar day cell
            title: t.title,

            // FullCalendar works well with an ISO "YYYY-MM-DD" date for all-day events
            start: t.due_date.slice(0, 10),

            // We treat tasks as all-day items (not timed events)
            allDay: true,

            // Style: same colour for background + border
            backgroundColor: bg,
            borderColor: bg,

            // Extra data we want available when rendering the event / details
            extendedProps: {
              task: t,
              status: statusFromProgress(t.progress),
            },
          };
        })
    );
  }, [tasks]);

  // When an event is clicked:
  // - if it's already open, close it
  // - otherwise open that one
  const onEventClick = (arg) => {
    const id = arg.event.id;
    setSelectedEventId((prev) => (prev === id ? null : id));
  };

  // Custom event rendering.
  // FullCalendar calls this to decide what each event "looks like" in the UI.
  const renderEventContent = (arg) => {
    const isOpen = arg.event.id === selectedEventId;

    // We stored these in extendedProps above when we created the events list
    const task = arg.event.extendedProps?.task || {};
    const status = arg.event.extendedProps?.status;

    return (
      <div className={`task-pill ${isOpen ? "open" : ""}`}>
        {/* Always show the task title */}
        <div className="title">{arg.event.title}</div>

        {/* Only show details when the event is "open" */}
        {isOpen && (
          <div className="details">
            {/* Optional description */}
            {task.description && <p className="desc">{task.description}</p>}

            {/* Metadata list */}
            <dl className="meta">
              <div>
                <dt>Due:</dt>
                <dd>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString("en-GB")
                    : "-"}
                </dd>
              </div>

              {/* Status derived from progress */}
              {status && (
                <div>
                  <dt>Status:</dt>
                  <dd className="capitalize">{status}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="calendar-card-wrapper">
      <div className="calendar">
        <FullCalendar
          // Register calendar plugins (month grid, week/day time grid, click support)
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}

          // Default view when the page loads
          initialView="dayGridMonth"

          // Top toolbar layout + buttons
          headerToolbar={{
            start: "today prev,next",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay",
          }}

          // Make the calendar fill the wrapper height
          height="100%"

          // Provide events array built from Redux tasks
          events={events}

          // Handle clicking an event
          eventClick={onEventClick}

          // Custom render function for each event
          eventContent={renderEventContent}

          // Make events render as blocks (better for custom pills)
          eventDisplay="block"

          // Limit how many events show before "+ more" appears
          dayMaxEventRows={2}
        />
      </div>
    </div>
  );
}
