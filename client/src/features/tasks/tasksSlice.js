import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../api/client";

const initialState = {
    tasks: [],
    loading: false,
    error: null,
};

// GET /api/tasks -> returns array of tasks
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async (_, thunkAPI) => {
    try {
        const data = await apiFetch("/api/tasks");
        return data; // already an array
    } catch (err) {
        return thunkAPI.rejectWithValue(err?.message || "Failed to load tasks");
    }
});

// POST /api/tasks -> returns created task object
export const createTask = createAsyncThunk("tasks/createTask", async (payload, thunkAPI) => {
    try {
        // payload should be: { title, due_date, progress, project_id }
        const data = await apiFetch("/api/tasks", {
            method: "POST",
            body: JSON.stringify(payload),
        });
        return data; // created task object
    } catch (err) {
        return thunkAPI.rejectWithValue(err?.message || "Failed to create task");
    }
});

// PUT /api/tasks/:id -> returns updated task object
export const updateTask = createAsyncThunk("tasks/updateTask", async ({ id, updates }, thunkAPI) => {
    try {
        const data = await apiFetch(`/api/tasks/${id}`, {
            method: "PUT",
            body: JSON.stringify(updates),
        });
        return data; // updated task object
    } catch (err) {
        return thunkAPI.rejectWithValue(err?.message || "Failed to update task");
    }
});

// DELETE /api/tasks/:id -> returns deleted task object
export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id, thunkAPI) => {
    try {
        const data = await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
        return data; // deleted task object (has id)
    } catch (err) {
        return thunkAPI.rejectWithValue(err?.message || "Failed to delete task");
    }
});

const tasksSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchTasks
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // createTask
            .addCase(createTask.pending, (state) => {
                state.error = null;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.tasks.push(action.payload);
            })
            .addCase(createTask.rejected, (state, action) => {
                state.error = action.payload;
            })

            // updateTask
            .addCase(updateTask.pending, (state) => {
                state.error = null;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const updated = action.payload;
                const idx = state.tasks.findIndex((t) => t.id === updated.id);

                if (idx !== -1) {
                    const existing = state.tasks[idx];

                    state.tasks[idx] = {
                        ...existing,
                        ...updated,
                        // preserve project_name until next full fetch
                        project_name: updated.project_name ?? existing.project_name ?? null,
                    };
                }
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.error = action.payload;
            })

            // deleteTask
            .addCase(deleteTask.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                const deletedId = action.payload.id;
                state.tasks = state.tasks.filter((t) => t.id !== deletedId);
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default tasksSlice.reducer;