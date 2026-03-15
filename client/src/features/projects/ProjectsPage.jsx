import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Thunks (async actions) for CRUD operations on projects
import { fetchProjects, createProject, updateProject, deleteProject } from "./projectsSlice";
import "./projectsPage.css";

// Options used to render the Status dropdown + status dot colour in the UI
const STATUS_OPTIONS = [
    { value: "Not Started", label: "Not Started", color: "red" },
    { value: "In Progress", label: "In Progress", color: "yellow" },
    { value: "Complete", label: "Complete", color: "green" },
];

// Helper: given a status string, return the full metadata (label + colour)
// Falls back to "Not Started" if status is missing/unknown.
function statusMeta(status) {
    return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
}

export default function ProjectsPage() {
    // Redux: dispatch actions/thunks
    const dispatch = useDispatch();

    // Router: navigate to another page programmatically
    const navigate = useNavigate();

    // Redux: read projects list from store
    const projects = useSelector((s) => s.projects.projects);

    // Fetch projects from backend when this page first loads
    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    // ----------------------------
    // Add Project form state
    // ----------------------------
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [scheduledCompletion, setScheduledCompletion] = useState("");
    const [status, setStatus] = useState("Not Started");

    // ----------------------------
    // Inline edit state
    // editingId = which project is currently being edited
    // draft = local "working copy" of that project's fields while editing
    // ----------------------------
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({
        name: "",
        scheduled_completion: "",
        status: "Not Started",
    });

    // Reset the add form back to defaults
    const resetAddForm = () => {
        setName("");
        setScheduledCompletion("");
        setStatus("Not Started");
    };

    // Create a new project
    const handleAdd = (e) => {
        e.preventDefault(); // stop form from reloading the page
        if (!name.trim()) return; // basic validation

        // Dispatch thunk to create project on backend
        dispatch(
            createProject({
                name: name.trim(),
                scheduled_completion: scheduledCompletion || null, // send null if no date
                status: status || "Not Started",
            })
        );

        // Clear UI after create
        resetAddForm();
        setShowForm(false);
    };

    // Enter edit mode for a specific project and pre-fill draft values
    const startEdit = (p) => {
        setEditingId(p.id);

        // Date input needs YYYY-MM-DD, so slice the ISO string
        setDraft({
            name: p.name || "",
            scheduled_completion: p.scheduled_completion ? p.scheduled_completion.slice(0, 10) : "",
            status: p.status || "Not Started",
        });
    };

    // Save edits for a specific project
    const saveEdit = (id) => {
        dispatch(
            updateProject({
                id,
                updates: {
                    name: draft.name.trim(),
                    scheduled_completion: draft.scheduled_completion || null,
                    status: draft.status,
                },
            })
        );

        // Exit edit mode
        setEditingId(null);
    };

    // Exit edit mode without saving
    const cancelEdit = () => setEditingId(null);

    // Helper to format ISO date into UK format for display
    const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString("en-GB") : "-");

    return (
        <div className="projects-wrapper">
            <header className="page-header">
                <h1>My Projects</h1>

                <div className="header-buttons">
                    {/* Toggle the "Add New" form */}
                    <button
                        className="link-btn"
                        onClick={() => setShowForm((v) => !v)}
                        type="button"
                    >
                        {showForm ? "Cancel" : "Add New"}
                    </button>
                </div>
            </header>

            {/* Add new project form */}
            {showForm && (
                <form
                    className="project-card project-card--editing project-card--new"
                    onSubmit={handleAdd}
                >
                    <div data-label="Name">
                        <input
                            type="text"
                            placeholder="Creative Project Name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div data-label="Date">
                        <input
                            type="date"
                            value={scheduledCompletion}
                            onChange={(e) => setScheduledCompletion(e.target.value)}
                        />
                    </div>

                    <div data-label="Status">
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="row-actions">
                        <button className="save-btn" type="submit">
                            Create
                        </button>
                    </div>
                </form>
            )}

            <div className="projects-container">
                {/* Column headings */}
                <div className="projects-columns">
                    <div>Project Name</div>
                    <div>Scheduled Completion</div>
                    <div>Status</div>
                    <div></div>
                </div>

                <div className="projects-list">
                    {/* Empty state */}
                    {projects.length === 0 && (
                        <div className="empty">No projects found. Ready to start something new?</div>
                    )}

                    {/* Render each project card */}
                    {projects.map((p) => {
                        const meta = statusMeta(p.status);
                        const isEditing = editingId === p.id;

                        return (
                            <div
                                key={p.id}
                                className={`project-card ${isEditing ? "project-card--editing" : ""}`}
                            >
                                {/* NAME */}
                                <div data-label="Name">
                                    {isEditing ? (
                                        <input
                                            autoFocus
                                            type="text"
                                            value={draft.name}
                                            onChange={(e) =>
                                                setDraft((d) => ({ ...d, name: e.target.value }))
                                            }
                                        />
                                    ) : (
                                        <button
                                            className="project-link"
                                            onClick={() => navigate(`/projects/${p.id}`)}
                                            type="button"
                                        >
                                            {p.name}
                                        </button>
                                    )}
                                </div>

                                {/* DATE */}
                                <div data-label="Scheduled Completion">
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={draft.scheduled_completion}
                                            onChange={(e) =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    scheduled_completion: e.target.value,
                                                }))
                                            }
                                        />
                                    ) : (
                                        <span style={{ color: "var(--chalk-200)", fontSize: "0.95rem" }}>
                                            {fmt(p.scheduled_completion)}
                                        </span>
                                    )}
                                </div>

                                {/* STATUS */}
                                <div data-label="Status">
                                    {isEditing ? (
                                        <select
                                            value={draft.status}
                                            onChange={(e) =>
                                                setDraft((d) => ({ ...d, status: e.target.value }))
                                            }
                                        >
                                            {STATUS_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="status-badge">
                                            <span className={`status-dot status-dot-${meta.color}`}></span>
                                            {meta.label}
                                        </div>
                                    )}
                                </div>

                                {/* ACTIONS */}
                                <div className="row-actions">
                                    {isEditing ? (
                                        <>
                                            <button 
                                                className="save-btn" 
                                                onClick={() => saveEdit(p.id)} 
                                                type="button"
                                            >
                                                Save
                                            </button>
                                            <button 
                                                className="link-btn" 
                                                onClick={cancelEdit} 
                                                type="button"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                className="link-btn" 
                                                onClick={() => startEdit(p)} 
                                                type="button"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => dispatch(deleteProject(p.id))}
                                                type="button"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}