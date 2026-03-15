import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CalendarPage from "../features/calendar/CalendarPage";


// Mock Redux so we can control what tasks the calendar receives
let mockState = {
    tasks: { tasks: [] },
};

vi.mock("react-redux", () => ({
    useSelector: (selector) => selector(mockState),
}));

/*
Mock FullCalendar so we can test the props passed into it
without relying on the real calendar library in tests.
*/
vi.mock("@fullcalendar/react", () => ({
    default: ({ events }) => (
        <div>
            <h2>Mock Calendar</h2>

            {events.map((event) => (
                <div key={event.id}>
                    <span>{event.title}</span>
                    <span>{event.start}</span>
                </div>
            ))}
        </div>
    ),
}));

vi.mock("@fullcalendar/daygrid", () => ({
    default: {},
}));

vi.mock("@fullcalendar/timegrid", () => ({
    default: {},
}));

vi.mock("@fullcalendar/interaction", () => ({
    default: {},
}));

function renderCalendarPage() {
    return render(<CalendarPage />);
}

describe("CalendarPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockState = {
            tasks: { tasks: [] },
        };
    });

    it("renders the calendar", () => {
        renderCalendarPage();

        expect(screen.getByText("Mock Calendar")).toBeInTheDocument();
    });

    it("displays tasks on the correct dates", () => {
        mockState.tasks.tasks = [
            {
                id: 1,
                title: "Build API",
                due_date: "2026-03-20",
                progress: 50,
            },
            {
                id: 2,
                title: "Write Docs",
                due_date: "2026-03-25",
                progress: 0,
            },
        ];

        renderCalendarPage();

        expect(screen.getByText("Build API")).toBeInTheDocument();
        expect(screen.getByText("2026-03-20")).toBeInTheDocument();

        expect(screen.getByText("Write Docs")).toBeInTheDocument();
        expect(screen.getByText("2026-03-25")).toBeInTheDocument();
    });
});