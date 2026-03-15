import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./projectCard.css";

// Small helper for making API calls (wraps fetch + JSON parsing etc.)
import { apiFetch } from "../../api/client"; // adjust path if needed

// Redux thunks for CRUD actions on tasks
import { createTask, updateTask, deleteTask } from "../tasks/tasksSlice"; // adjust path if needed

export default function ProjectCard() {
    // Read route param from URL (e.g. /projects/12 -> projectId = "12")
    const { projectId } = useParams();

    // For programmatic navigation (back button etc.)
    const navigate = useNavigate();

    // Redux dispatch to trigger actions/thunks
    const dispatch = useDispatch();

    // Get all projects already stored in Redux
    const projects = useSelector((s) => s.projects.projects);

    // Find the specific project in the store.
    // useMemo avoids re-running find() unless projects/projectId changes.
    const project = useMemo(
        () => projects.find((p) => String(p.id) === String(projectId)),
        [projects, projectId]
    );

    // ----------------------------
    // Local state for THIS project's tasks
    // We fetch them from /api/projects/:id/tasks
    // ----------------------------
    const [projectTasks, setProjectTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [tasksError, setTasksError] = useState("");

    // Fetch project tasks whenever projectId changes
    useEffect(() => {
        // Simple pattern to avoid setting state after unmount
        let cancelled = false;

        const loadProjectTasks = async () => {
            try {
                setLoadingTasks(true);
                setTasksError("");

                // Call the backend endpoint for tasks under this project
                const data = await apiFetch(`/api/projects/${projectId}/tasks`);

                // Only update state if component is still mounted
                if (!cancelled) setProjectTasks(Array.isArray(data) ? data : []);
            } catch (err) {
                if (!cancelled) setTasksError(err?.message || "Failed to load project tasks");
            } finally {
                if (!cancelled) setLoadingTasks(false);
            }
        };

        loadProjectTasks();

        // Cleanup runs if component unmounts or projectId changes mid-request
        return () => {
            cancelled = true;
        };
    }, [projectId]);

    // ----------------------------
    // Add task form state
    // ----------------------------
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [progress, setProgress] = useState(0);

    // Create a new task linked to this project
    const handleAddTask = async (e) => {
        e.preventDefault(); // prevent form page refresh
        if (!title.trim()) return; // basic validation

        try {
            // Dispatch thunk that posts to API and returns created task in payload
            const action = await dispatch(
                createTask({
                    title: title.trim(),
                    due_date: dueDate || null, // send null if empty
                    project_id: Number(projectId), // ensure numeric id
                    progress: Number(progress) || 0, // ensure a number
                })
            );

            // RTK thunk returns {payload} when fulfilled
            const created = action.payload;

            // Update local list immediately so UI feels instant
            if (created?.id) {
                setProjectTasks((prev) => [created, ...prev]);
            }

            // Reset form fields
            setTitle("");
            setDueDate("");
            setProgress(0);
        } catch (err) {
            console.log(err)
        }
    };

    // ----------------------------
    // Edit mode state
    // ----------------------------
    const [editingTaskId, setEditingTaskId] = useState(null);

    // Draft holds the "in-progress" edits before saving
    const [draft, setDraft] = useState({ title: "", due_date: "", progress: 0 });

    // Enter edit mode for a task and pre-fill the draft values
    const startEdit = (task) => {
        setEditingTaskId(task.id);
        setDraft({
            title: task.title || "",
            // date input expects YYYY-MM-DD, so slice ISO string
            due_date: task.due_date ? task.due_date.slice(0, 10) : "",
            progress: task.progress ?? 0,
        });
    };

    // Save edits to backend via thunk, then update local list
    const saveEdit = async (id) => {
        const updates = {
            title: draft.title.trim(),
            due_date: draft.due_date || null,
            progress: Number(draft.progress) || 0,
        };

        const action = await dispatch(updateTask({ id, updates }));
        const updated = action.payload;

        if (updated?.id) {
            // Keep local list in sync without refetching
            setProjectTasks((prev) =>
                prev.map((t) =>
                    String(t.id) === String(updated.id) ? { ...t, ...updated } : t
                )
            );
        }

        // Exit edit mode
        setEditingTaskId(null);
    };

    // Exit edit mode without saving
    const cancelEdit = () => setEditingTaskId(null);

    // Delete task via thunk then remove from local list
    const handleDelete = async (id) => {
        const action = await dispatch(deleteTask(id));
        const deleted = action.payload;

        // Your API returns deleted task object, but fallback to id just in case
        const deletedId = deleted?.id ?? id;

        setProjectTasks((prev) => prev.filter((t) => String(t.id) !== String(deletedId)));
    };

    // If user navigated to a projectId that doesn't exist in store
    if (!project) {
        return (
            <div className="card-wrapper">
                <div className="header">
                    <button
                        className="link-btn"
                        onClick={() => navigate("/projects")}
                        type="button"
                    >
                        ← Back to Projects
                    </button>
                    <h1>Project not found</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="card-wrapper">
            <div className="header">
                {/* Back button */}
                <button className="link-btn" onClick={() => navigate("/projects")} type="button">
                    Back to Projects
                </button>

                <h1 className="name">{project.name}</h1>

                {/* Project meta info */}
                <div className="meta">
                    <span className="due">
                        Due:{" "}
                        {project.scheduled_completion
                            ? new Date(project.scheduled_completion).toLocaleDateString("en-GB")
                            : "-"}
                    </span>
                    <span>Status: {project.status || "-"}</span>
                </div>
            </div>

            <div className="tasks">
                {/* Column labels */}
                <div className="task-columns">
                    <span>Task</span>
                    <span>Due Date</span>
                    <span>Progress</span>
                </div>

                {/* Loading / error / empty / list states */}
                {loadingTasks ? (
                    <p className="empty">Loading tasks...</p>
                ) : tasksError ? (
                    <p className="empty">{tasksError}</p>
                ) : projectTasks.length === 0 ? (
                    <p className="empty">No tasks assigned to this project yet.</p>
                ) : (
                    <ul className="task-list">
                        {projectTasks.map((t) => {
                            const isEditing = editingTaskId === t.id;

                            return (
                                <li key={t.id} className="task-row">
                                    {isEditing ? (
                                        <>
                                            {/* Edit title */}
                                            <input
                                                type="text"
                                                value={draft.title}
                                                onChange={(e) =>
                                                    setDraft((d) => ({ ...d, title: e.target.value }))
                                                }
                                            />

                                            {/* Edit due date */}
                                            <input
                                                type="date"
                                                value={draft.due_date}
                                                onChange={(e) =>
                                                    setDraft((d) => ({ ...d, due_date: e.target.value }))
                                                }
                                            />

                                            {/* Edit progress + action buttons */}
                                            <div className="task-progress">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={draft.progress}
                                                    onChange={(e) =>
                                                        setDraft((d) => ({ ...d, progress: e.target.value }))
                                                    }
                                                    style={{ width: "60px" }}
                                                />

                                                <button
                                                    className="save-btn"
                                                    onClick={() => saveEdit(t.id)}
                                                    type="button"
                                                >
                                                    Save
                                                </button>

                                                <button className="link-btn" onClick={cancelEdit} type="button">
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Read-only view */}
                                            <span className="task-name">
                                                <strong>{t.title}</strong>
                                            </span>

                                            <span className="task-due muted">
                                                {t.due_date ? t.due_date.slice(0, 10) : "-"}
                                            </span>

                                            <span className="task-progress">
                                                {t.progress}%{" "}
                                                <button className="link-btn" onClick={() => startEdit(t)} type="button">
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(t.id)}
                                                    type="button"
                                                >
                                                    Delete
                                                </button>
                                            </span>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Inline "add new task" form */}
                <form className="add-task-inline" onSubmit={handleAddTask}>
                    <input
                        type="text"
                        placeholder="New Task"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

                    <div className="task-progress">
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={progress}
                            onChange={(e) => setProgress(e.target.value)}
                            placeholder="%"
                            style={{ width: "60px" }}
                        />
                        <button type="submit" className="save-btn">
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}