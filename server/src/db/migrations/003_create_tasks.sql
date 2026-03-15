CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES projects(id) ON DELETE
    SET NULL,
        title TEXT NOT NULL,
        due_date DATE,
        progress INTEGER NOT NULL DEFAULT 0 CHECK (
            progress >= 0
            AND progress <= 100
        ),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);