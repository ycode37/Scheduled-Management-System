import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../features/dashboard/Dashboard";

/*
Mock Redux hooks so we can control what tasks and projects
the dashboard cards receive from the store.
*/
let mockState = {
    tasks: { tasks: [] },
    projects: { projects: [] },
};

vi.mock("react-redux", () => ({
    useSelector: (selector) => selector(mockState),
}));

// Mock navigation because dashboard cards use useNavigate.
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

/*
Mock FullCalendar so the dashboard calendar section renders
without needing the real calendar library in the test.
*/
vi.mock("@fullcalendar/react", () => ({
    default: () => <div>Calendar Component</div>,
}));

vi.mock("@fullcalendar/daygrid", () => ({
    default: {},
}));

vi.mock("@fullcalendar/interaction", () => ({
    default: {},
}));

/*
Dashboard uses child components that rely on routing,
so we wrap it in MemoryRouter.
*/
function renderDashboard() {
    return render(
        <MemoryRouter>
            <Dashboard />
        </MemoryRouter>
    );
}

describe("Dashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockState = {
            tasks: { tasks: [] },
            projects: { projects: [] },
        };
    });

    it("renders the main sections", () => {
        renderDashboard();

        expect(
            screen.getByRole("heading", { name: /upcoming task/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { name: /projects/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { name: /calendar/i })
        ).toBeInTheDocument();
    });

    it("shows preview data for tasks and projects", () => {
        mockState.tasks.tasks = [
            {
                id: 1,
                title: "Build API",
                due_date: "2026-03-20",
                progress: 50,
            },
        ];

        mockState.projects.projects = [
            {
                id: 1,
                name: "Website Redesign",
                status: "In Progress",
                task_count: 3,
                scheduled_completion: "2026-03-25",
            },
        ];

        renderDashboard();

        // Task preview card
        expect(screen.getByText("Build API")).toBeInTheDocument();
        expect(screen.getByText(/status: ongoing/i)).toBeInTheDocument();

        // Project preview card
        expect(screen.getByText("Website Redesign")).toBeInTheDocument();
        expect(screen.getByText(/3 tasks/i)).toBeInTheDocument();
    });
});