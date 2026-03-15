import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../api/client";

const initialState = {
    projects: [],
    loading: false,
    error: null,
};

// GET /api/projects -> returns array
export const fetchProjects = createAsyncThunk(
    "projects/fetchProjects",
    async (_, thunkAPI) => {
        try {
            const data = await apiFetch("/api/projects");
            return data; // array
        } catch (err) {
            return thunkAPI.rejectWithValue(err?.message || "Failed to load projects");
        }
    }
);

// GET /api/projects/:id -> returns single project with task_count
export const fetchProjectById = createAsyncThunk(
    "projects/fetchProjectById",
    async (id, thunkAPI) => {
        try {
            const data = await apiFetch(`/api/projects/${id}`);
            return data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err?.message || "Failed to load project");
        }
    }
);

// POST /api/projects -> returns created project
// payload: { name, scheduled_completion?, status? }
export const createProject = createAsyncThunk(
    "projects/createProject",
    async (payload, thunkAPI) => {
        try {
            const data = await apiFetch("/api/projects", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            return data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err?.message || "Failed to create project");
        }
    }
);

// PUT /api/projects/:id -> returns updated project
export const updateProject = createAsyncThunk(
    "projects/updateProject",
    async ({ id, updates }, thunkAPI) => {
        try {
            const data = await apiFetch(`/api/projects/${id}`, {
                method: "PUT",
                body: JSON.stringify(updates),
            });
            return data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err?.message || "Failed to update project");
        }
    }
);

// DELETE /api/projects/:id -> returns deleted project object
export const deleteProject = createAsyncThunk(
    "projects/deleteProject",
    async (id, thunkAPI) => {
        try {
            const data = await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
            return data; // contains id
        } catch (err) {
            return thunkAPI.rejectWithValue(err?.message || "Failed to delete project");
        }
    }
);

const projectsSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetchProjects
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // createProject
            .addCase(createProject.pending, (state) => {
                state.error = null;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.projects.push(action.payload);
            })
            .addCase(createProject.rejected, (state, action) => {
                state.error = action.payload;
            })

            // updateProject
            .addCase(updateProject.pending, (state) => {
                state.error = null;
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                const updated = action.payload;
                const idx = state.projects.findIndex((p) => p.id === updated.id);
                if (idx !== -1) {
                    const existingTaskCount = state.projects[idx].task_count;
                    state.projects[idx] = {
                        ...updated,
                        task_count: updated.task_count ?? existingTaskCount ?? 0,
                    };
                }
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.error = action.payload;
            })

            // deleteProject
            .addCase(deleteProject.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                const deletedId = action.payload.id;
                state.projects = state.projects.filter((p) => p.id !== deletedId);
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.error = action.payload;
            })

            // fetchProjectById 
            .addCase(fetchProjectById.fulfilled, (state, action) => {
                const proj = action.payload;
                const idx = state.projects.findIndex((p) => p.id === proj.id);
                if (idx !== -1) state.projects[idx] = proj;
                else state.projects.push(proj);
            });
    },
});

export default projectsSlice.reducer;