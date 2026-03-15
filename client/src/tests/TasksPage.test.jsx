import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import TasksPage from "../features/tasks/TasksPage";


// Mock Redux hooks so we can control state and track dispatch calls
const mockDispatch = vi.fn();

let mockState = {
    tasks: { tasks: [] },
    projects: { projects: [] },
};

vi.mock("react-redux", () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector) => selector(mockState),
}));


// Mock the task thunks used by the component
const mockFetchTasks = vi.fn(() => ({ type: "tasks/fetchTasks" }));
const mockCreateTask = vi.fn((payload) => ({
    type: "tasks/createTask",
    payload,
}));
const mockDeleteTask = vi.fn((id) => ({
    type: "tasks/deleteTask",
    payload: id,
}));

vi.mock("../features/tasks/tasksSlice", () => ({
    fetchTasks: () => mockFetchTasks(),
    createTask: (payload) => mockCreateTask(payload),
    updateTask: vi.fn(),
    deleteTask: (id) => mockDeleteTask(id),
}));


// TasksPage uses useSearchParams so we must wrap it in a Router
function renderTasksPage() {
    return render(
        <MemoryRouter>
            <TasksPage />
        </MemoryRouter>
    );
}

describe("TasksPage", () => {

    beforeEach(() => {
        vi.clearAllMocks();

        mockState = {
            tasks: { tasks: [] },
            projects: { projects: [] },
        };

        /*
        createTask uses dispatch(...).unwrap()
        so we mock the behaviour here
        */
        mockDispatch.mockImplementation((action) => {
            if (action?.type === "tasks/createTask") {
                return {
                    unwrap: vi.fn().mockResolvedValue({
                        id: 1,
                        ...action.payload,
                    }),
                };
            }

            return action;
        });
    });

    it("renders tasks returned from API", () => {
        mockState.tasks.tasks = [
            {
                id: 1,
                title: "Build API",
                due_date: "2026-03-20",
                project_id: null,
                progress: 40,
            },
        ];

        renderTasksPage();

        expect(screen.getByText("Build API")).toBeInTheDocument();
        expect(screen.getByText("40%")).toBeInTheDocument();
    });

    it("allows user to create a task", async () => {
        mockState.projects.projects = [
            { id: 1, name: "Website Project" },
        ];

        renderTasksPage();

        await userEvent.click(screen.getByRole("button", { name: /add new/i }));

        await userEvent.type(
            screen.getByPlaceholderText(/task name/i),
            "New Task"
        );

        await userEvent.selectOptions(
            screen.getByRole("combobox"),
            "1"
        );

        await userEvent.type(
            screen.getByPlaceholderText(/progress/i),
            "50"
        );

        await userEvent.click(
            screen.getByRole("button", { name: /save task/i })
        );

        expect(mockCreateTask).toHaveBeenCalledWith({
            title: "New Task",
            due_date: null,
            project_id: 1,
            progress: 50,
        });
    });

    it("allows user to delete a task", async () => {
        mockState.tasks.tasks = [
            {
                id: 1,
                title: "Build API",
                due_date: null,
                project_id: null,
                progress: 30,
            },
        ];

        renderTasksPage();

        const deleteButton = screen.getByRole("button", { name: /delete/i });

        await userEvent.click(deleteButton);

        expect(mockDeleteTask).toHaveBeenCalledWith(1);
    });

});