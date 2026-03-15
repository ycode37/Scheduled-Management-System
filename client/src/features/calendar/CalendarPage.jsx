import React, { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// FullCalendar + plugins (month/week/day views + click interactions)
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import { fetchTasks } from "../tasks/tasksSlice";
import "./calendarPage.css";

export default function CalendarPage() {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.tasks);

  // Fetch tasks on mount if not already there
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

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

  // Today's date in YYYY-MM-DD format for comparison
  const todayStr = new Date().toISOString().split("T")[0];

  // Logic for Today's Focus and Upcoming Tasks sidebar
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.due_date && t.due_date.slice(0, 10) === todayStr);
  }, [tasks, todayStr]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.due_date && t.due_date.slice(0, 10) > todayStr)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5); // Just show top 5 upcoming
  }, [tasks, todayStr]);

  return (
    <div className="calendar-wrapper-premium">
      <div className="calendar-main-area">
        <header className="page-header">
          <h1>Calendar</h1>
          <p className="subtitle">Track your project milestones and deadlines</p>
        </header>

        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              start: "today prev,next",
              center: "title",
              end: "dayGridMonth,timeGridWeek",
            }}
            height="100%"
            events={events}
            eventClick={onEventClick}
            eventContent={renderEventContent}
            eventDisplay="block"
            dayMaxEventRows={2}
          />
        </div>
      </div>

      <aside className="calendar-sidebar">
        <div className="sidebar-section">
          <h3>Today's Focus</h3>
          <div className="sidebar-tasks">
            {todayTasks.length === 0 ? (
              <p className="empty-side">Clear schedule for today.</p>
            ) : (
              todayTasks.map((t) => (
                <div key={t.id} className="side-task-card" style={{ borderLeftColor: colorFromProgress(t.progress) }}>
                  <span className="task-title">{t.title}</span>
                  <span className="task-sub">{t.project_name || "General"}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Upcoming</h3>
          <div className="sidebar-tasks">
            {upcomingTasks.length === 0 ? (
              <p className="empty-side">No upcoming deadlines.</p>
            ) : (
              upcomingTasks.map((t) => (
                <div key={t.id} className="side-task-card upcoming">
                  <div className="task-info">
                    <span className="task-title">{t.title}</span>
                    <span className="task-sub">{new Date(t.due_date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
