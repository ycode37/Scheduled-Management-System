import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";


// Mock Redux hooks so we can control state and track dispatch calls
const mockDispatch = vi.fn();

let mockState = {
    projects: { projects: [] },
};

vi.mock("react-redux", () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector) => selector(mockState),
}));


// Mock navigation because ProjectsPage uses useNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});


// Mock the project thunks used by the component
const mockFetchProjects = vi.fn(() => ({ type: "projects/fetchProjects" }));
const mockCreateProject = vi.fn((payload) => ({
    type: "projects/createProject",
    payload,
}));
const mockDeleteProject = vi.fn((id) => ({
    type: "projects/deleteProject",
    payload: id,
}));

vi.mock("../features/projects/projectsSlice", () => ({
    fetchProjects: () => mockFetchProjects(),
    createProject: (payload) => mockCreateProject(payload),
    updateProject: vi.fn(),
    deleteProject: (id) => mockDeleteProject(id),
}));

import ProjectsPage from "../features/projects/ProjectsPage";


// ProjectsPage uses useNavigate, so it must be wrapped in a Router
function renderProjectsPage() {
    return render(
        <MemoryRouter>
            <ProjectsPage />
        </MemoryRouter>
    );
}

describe("ProjectsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockState = {
            projects: { projects: [] },
        };
    });

    it("renders projects on the page", () => {
        mockState.projects.projects = [
            {
                id: 1,
                name: "Website Redesign",
                scheduled_completion: "2026-03-20",
                status: "In Progress",
            },
        ];

        renderProjectsPage();

        expect(screen.getByText("Website Redesign")).toBeInTheDocument();
        expect(screen.getByText("In Progress")).toBeInTheDocument();
    });

    it("allows user to create a project", async () => {
        renderProjectsPage();

        await userEvent.click(screen.getByRole("button", { name: /add new/i }));

        await userEvent.type(
            screen.getByPlaceholderText(/project name/i),
            "New Project"
        );

        await userEvent.selectOptions(
            screen.getByRole("combobox"),
            "Complete"
        );

        await userEvent.click(screen.getByRole("button", { name: /save/i }));

        expect(mockCreateProject).toHaveBeenCalledWith({
            name: "New Project",
            scheduled_completion: null,
            status: "Complete",
        });
    });

    it("allows user to delete a project", async () => {
        mockState.projects.projects = [
            {
                id: 1,
                name: "Website Redesign",
                scheduled_completion: "2026-03-20",
                status: "In Progress",
            },
        ];

        renderProjectsPage();

        await userEvent.click(screen.getByRole("button", { name: /delete/i }));

        expect(mockDeleteProject).toHaveBeenCalledWith(1);
    });
});