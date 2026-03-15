import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

// Thunks (async actions)
import { fetchTasks, createTask, updateTask, deleteTask } from "./tasksSlice";

// UI assets + styles
import sortIcon from "../../assets/sort.png";
import pencil from "../../assets/pencil.png";
import "./tasksPage.css";

export default function TasksPage() {
    // Redux: dispatch lets us fire actions / thunks
    const dispatch = useDispatch();

    // Redux: pull the latest tasks + projects from the store
    const tasks = useSelector((state) => state.tasks.tasks);
    const projects = useSelector((state) => state.projects.projects);

    // Read query params from the URL (e.g. ?editId=12&field=name)
    const [searchParams] = useSearchParams();

    // ----------------------------
    // Form state (Add New Task)
    // ----------------------------
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [project, setProject] = useState("");
    const [progress, setProgress] = useState("");

    // Sorting state (shared across multiple sort buttons)
    const [sortOrder, setSortOrder] = useState("asc");

    // We keep a separate list so we can sort/filter without mutating the Redux list
    const [displayedTasks, setDisplayedTasks] = useState(tasks);

    // Inline edit state:
    // - id: which task is currently being edited
    // - field: which column is being edited (name/date/project/progress)
    const [isEditing, setIsEditing] = useState({ id: null, field: null });

    // What the user has typed into the inline editor input/select
    const [editValue, setEditValue] = useState("");

    // Controls which row shows edit pencil icons + "Close" button
    const [activeEditRow, setActiveEditRow] = useState(null);

    // Toggle the "Add New" form open/closed
    const [showForm, setShowForm] = useState(false);

    // 1) Load tasks from backend on mount (runs once when component mounts)
    useEffect(() => {
        dispatch(fetchTasks());
    }, [dispatch]);

    // Keep displayedTasks in sync whenever tasks in Redux changes
    // (e.g. after fetch, create, update, delete)
    useEffect(() => {
        setDisplayedTasks(tasks);
    }, [tasks]);

    // Submit handler for creating a new task
    const handleAdd = async (e) => {
        e.preventDefault(); // stop page reload
        console.log("SUBMIT FIRED"); // quick debug to confirm submit is firing

        // Basic validation: prevent blank titles
        if (!name.trim()) return;

        try {
            // Build payload in the shape your API expects
            const payload = {
                title: name.trim(),
                due_date: date || null, // send null if no date chosen
                project_id: project ? Number(project) : null, // store IDs as numbers in the DB
                progress: Number(progress) || 0, // ensure a number; default to 0
            };

            console.log("Creating task payload:", payload);

            // unwrap() throws if thunk rejects, so we can catch it in this try/catch
            const created = await dispatch(createTask(payload)).unwrap();
            console.log("Created task:", created);

            // Reset form fields after successful create
            setName("");
            setDate("");
            setProject("");
            setProgress(0);
            setShowForm(false);
        } catch (err) {
            // Helpful debugging + simple user feedback
            console.error("Create task failed:", err);
            alert(err?.message || "Create task failed");
        }
    };

    // Sort tasks by title (A-Z / Z-A)
    const handleSortByName = () => {
        // Toggle between ascending/descending each click
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);

        // Copy the array first so we don't mutate Redux state
        const sorted = [...tasks].sort((a, b) => {
            // Safeguard if title is missing
            const aTitle = a.title || "";
            const bTitle = b.title || "";
            return newOrder === "asc"
                ? aTitle.localeCompare(bTitle)
                : bTitle.localeCompare(aTitle);
        });

        setDisplayedTasks(sorted);
    };

    // Sort tasks by due date (oldest/newest)
    const handleSortByDate = () => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);

        const sorted = [...tasks].sort((a, b) => {
            // If no date, treat as epoch so it sorts consistently
            const dateA = a.due_date ? new Date(a.due_date) : new Date(0);
            const dateB = b.due_date ? new Date(b.due_date) : new Date(0);

            // Subtracting dates gives milliseconds difference
            return newOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

        setDisplayedTasks(sorted);
    };

    // Sort tasks by project name (A-Z / Z-A)
    const handleByProject = () => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);

        const sorted = [...tasks].sort((a, b) => {
            const projectA = a.project_name || "";
            const projectB = b.project_name || "";
            return newOrder === "asc"
                ? projectA.localeCompare(projectB)
                : projectB.localeCompare(projectA);
        });

        setDisplayedTasks(sorted);
    };

    // Sort tasks by progress number (low/high or high/low)
    const handleSortByProgress = () => {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);

        const sorted = [...tasks].sort((a, b) => {
            const aProg = Number(a.progress) || 0;
            const bProg = Number(b.progress) || 0;
            return newOrder === "asc" ? aProg - bProg : bProg - aProg;
        });

        setDisplayedTasks(sorted);
    };

    // Start editing a cell: store which task + which field, and preload the input value
    const handleEdit = (taskId, field, currentValue) => {
        setIsEditing({ id: taskId, field });
        setEditValue(currentValue ?? ""); // default to empty string if null/undefined
    };

    // Save a single edited field back to the API via updateTask thunk
    const handleSaveEdit = (taskId) => {
        const field = isEditing.field;

        // Map UI field names -> API field names
        // (UI shows "name" but API stores "title", etc.)
        const apiField =
            field === "name"
                ? "title"
                : field === "date"
                    ? "due_date"
                    : field === "project"
                        ? "project_id"
                        : field; // progress stays as "progress"

        // Normalize values into the correct types for the API
        const apiValue =
            apiField === "progress"
                ? Number(editValue) || 0
                : apiField === "project_id"
                    ? editValue
                        ? Number(editValue) // convert dropdown value back to number
                        : null
                    : apiField === "due_date"
                        ? editValue || null // send null to clear date
                        : editValue;

        // Dispatch an update with { id, updates } shape
        dispatch(updateTask({ id: taskId, updates: { [apiField]: apiValue } }));

        // Exit edit mode + reset local edit value
        setIsEditing({ id: null, field: null });
        setEditValue("");
    };

    // Keyboard controls for inline edit:
    // - Enter saves
    // - Escape cancels
    const handleKeyDown = (e, taskId) => {
        if (e.key === "Enter") handleSaveEdit(taskId);
        if (e.key === "Escape") {
            setIsEditing({ id: null, field: null });
            setEditValue("");
        }
    };

    // Helper: find a task by id, allowing for string/number mismatch
    const findTaskById = (id) => tasks.find((t) => String(t.id) === String(id));

    // If URL has ?editId=...&field=..., automatically open that row in edit mode
    useEffect(() => {
        const editId = searchParams.get("editId");
        const field = searchParams.get("field") || "name"; // default field if missing

        // Wait until tasks are loaded
        if (!editId || tasks.length === 0) return;

        const task = findTaskById(editId);
        if (!task) return;

        // Ensure we're showing the full list (not a previously sorted subset)
        setDisplayedTasks(tasks);

        // Show edit controls for this row
        setActiveEditRow(task.id);

        // Pick the correct "currentValue" based on requested field
        // Note: date input expects YYYY-MM-DD, so we slice the ISO string.
        const currentValue =
            field === "name"
                ? task.title
                : field === "date"
                    ? (task.due_date ? task.due_date.slice(0, 10) : "")
                    : field === "project"
                        ? (task.project_id || "")
                        : field === "progress"
                            ? String(task.progress ?? 0)
                            : "";

        // Enable inline editor for that cell
        setIsEditing({ id: task.id, field });
        setEditValue(currentValue ?? "");

        // Scroll the row into view after DOM updates
        requestAnimationFrame(() => {
            const row = document.querySelector(`tr[data-task-id="${task.id}"]`);
            if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }, [searchParams, tasks]);

    return (
        <div className="task-wrapper">
            <div className="page-header">
                <h1>Welcome to your tasks...</h1>

                <div className="header-buttons">
                    {/* Toggle Add New form */}
                    <button className="link-btn" onClick={() => setShowForm((prev) => !prev)}>
                        {showForm ? "Close" : "Add New"}
                    </button>
                </div>
            </div>

            {/* Create task form (only visible when showForm is true) */}
            {showForm && (
                <form className="add-task-form" onSubmit={handleAdd}>
                    <input
                        type="text"
                        placeholder="Task Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />

                    {/* Project dropdown stores the project id as a string in the <select> */}
                    <select className="project-select" value={String(project)} onChange={(e) => setProject(e.target.value)}>
                        <option value="">Select a Project...</option>
                        {projects.map((p) => (
                            <option key={p.id} value={String(p.id)}>
                                {p.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Progress"
                        value={progress}
                        onChange={(e) => setProgress(e.target.value)}
                    />

                    <button type="submit">Save Task</button>
                </form>
            )}

            <div className="task-table-wrapper">
                <div className="task-table">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    Task Name{" "}
                                    {/* Sort button uses type="button" so it doesn't submit the form */}
                                    <button
                                        className="sortIcon-btn"
                                        onClick={handleSortByName}
                                        type="button"
                                    >
                                        <img src={sortIcon} alt="sort-icon" className="sortIcon" />
                                    </button>
                                </th>

                                <th>
                                    Task Date{" "}
                                    <button
                                        className="sortingIcon-btn"
                                        onClick={handleSortByDate}
                                        type="button"
                                    >
                                        <img src={sortIcon} alt="sort-icon" className="sortIcon" />
                                    </button>
                                </th>

                                <th>
                                    Project{" "}
                                    <button
                                        className="sortIcon-btn"
                                        onClick={handleByProject}
                                        type="button"
                                    >
                                        <img src={sortIcon} alt="sort-icon" className="sortIcon" />
                                    </button>
                                </th>

                                <th>
                                    Progress{" "}
                                    <button
                                        className="sortingIcon-btn"
                                        onClick={handleSortByProgress}
                                        type="button"
                                    >
                                        <img src={sortIcon} alt="sort-icon" className="sortIcon" />
                                    </button>
                                </th>

                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {/* Empty state */}
                            {displayedTasks.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                                        No tasks yet - add some above !
                                    </td>
                                </tr>
                            ) : (
                                // Render each task row
                                displayedTasks.map((task) => (
                                    <tr key={task.id} data-task-id={task.id}>
                                        {/* ------------------ NAME CELL ------------------ */}
                                        <td data-label="Task Name">
                                            {isEditing?.id === task.id && isEditing.field === "name" ? (
                                                // Inline edit input
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={() => handleSaveEdit(task.id)} // save on click-away
                                                    onKeyDown={(e) => handleKeyDown(e, task.id)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <>
                                                    {task.title}
                                                    {/* Pencil only shows when the row is in "Edit mode" */}
                                                    {activeEditRow === task.id && (
                                                        <button
                                                            className="edit-btn"
                                                            type="button"
                                                            onClick={() => handleEdit(task.id, "name", task.title)}
                                                        >
                                                            <img src={pencil} alt="edit" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </td>

                                        {/* ------------------ DATE CELL ------------------ */}
                                        <td data-label="Task Date">
                                            {isEditing?.id === task.id && isEditing.field === "date" ? (
                                                <input
                                                    type="date"
                                                    value={editValue || ""}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={() => handleSaveEdit(task.id)}
                                                    onKeyDown={(e) => handleKeyDown(e, task.id)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <>
                                                    {/* Display only YYYY-MM-DD */}
                                                    {task.due_date ? task.due_date.slice(0, 10) : "-"}
                                                    {activeEditRow === task.id && (
                                                        <button
                                                            className="edit-btn"
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    task.id,
                                                                    "date",
                                                                    task.due_date ? task.due_date.slice(0, 10) : ""
                                                                )
                                                            }
                                                        >
                                                            <img src={pencil} alt="edit" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </td>

                                        {/* ------------------ PROJECT CELL ------------------ */}
                                        <td data-label="Project">
                                            {isEditing?.id === task.id && isEditing.field === "project" ? (
                                                // Dropdown edit: save immediately when user changes selection
                                                <select
                                                    value={String(editValue || "")}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setEditValue(value);

                                                        // Save immediately for dropdown changes (no blur/enter needed)
                                                        dispatch(
                                                            updateTask({
                                                                id: task.id,
                                                                updates: { project_id: value ? Number(value) : null },
                                                            })
                                                        );

                                                        // Exit editing mode after saving
                                                        setIsEditing({ id: null, field: null });
                                                        setEditValue("");
                                                    }}
                                                    autoFocus
                                                >
                                                    <option value="">Unassigned</option>
                                                    {projects.map((p) => (
                                                        <option key={p.id} value={String(p.id)}>
                                                            {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <>
                                                    {/* Find matching project name from projects list */}
                                                    {projects.find((p) => String(p.id) === String(task.project_id))
                                                        ?.name || "-"}
                                                    {activeEditRow === task.id && (
                                                        <button
                                                            className="edit-btn"
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    task.id,
                                                                    "project",
                                                                    task.project_id ? String(task.project_id) : ""
                                                                )
                                                            }
                                                        >
                                                            <img src={pencil} alt="edit" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        {/* ------------------ PROGRESS CELL ------------------ */}
                                        <td data-label="Progress">
                                            {isEditing?.id === task.id && isEditing.field === "progress" ? (
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={() => handleSaveEdit(task.id)}
                                                    onKeyDown={(e) => handleKeyDown(e, task.id)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="progress-cell">
                                                    {/* Bar */}
                                                    <div
                                                        className="progress-track"
                                                        role="progressbar"
                                                        aria-valuenow={Number(task.progress ?? 0)}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                    >
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${Math.min(100, Math.max(0, Number(task.progress ?? 0)))}%` }}
                                                        />
                                                    </div>

                                                    {/* Percent + pencil */}
                                                    <div className="progress-meta">
                                                        <span className="progress-text">{task.progress}%</span>

                                                        {activeEditRow === task.id && (
                                                            <button
                                                                className="edit-btn"
                                                                type="button"
                                                                onClick={() => handleEdit(task.id, "progress", String(task.progress ?? 0))}
                                                                aria-label="Edit progress"
                                                            >
                                                                <img src={pencil} alt="" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* ------------------ ACTIONS CELL ------------------ */}
                                        <td className="actions" data-label="Actions">
                                            {activeEditRow === task.id ? (
                                                // When row is active, show "Close" (and save current edit if still editing)
                                                <button
                                                    className="link-btn"
                                                    type="button"
                                                    onClick={() => {
                                                        if (isEditing.id === task.id) {
                                                            handleSaveEdit(task.id);
                                                        }
                                                        setActiveEditRow(null);
                                                    }}
                                                >
                                                    Close
                                                </button>
                                            ) : (
                                                <div className="actions-buttons">
                                                    {/* This just enables the pencil icons for the row */}
                                                    <button
                                                        className="link-btn"
                                                        type="button"
                                                        onClick={() => setActiveEditRow(task.id)}
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* Delete via thunk */}
                                                    <button
                                                        className="delete-btn"
                                                        type="button"
                                                        onClick={() => dispatch(deleteTask(task.id))}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}