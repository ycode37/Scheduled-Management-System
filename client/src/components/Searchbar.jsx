import { useMemo, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import searchIcon from "../assets/search-interface-symbol.png";
import "./Searchbar.css";

export default function Searchbar() {
    const [q, setQ] = useState("");
    const tasks = useSelector((s) => s.tasks.tasks);
    const projects = useSelector((s) => s.projects.projects);

    const searchRef = useRef(null);
    const nav = useNavigate();

    // Combined results: tasks + projects
    const results = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return [];

        const taskResults = tasks
            .filter((t) => (t.title || "").toLowerCase().includes(query)) 
            .map((t) => ({
                type: "task",
                id: t.id,
                label: t.title,
                meta: t.due_date ? `Due ${new Date(t.due_date).toLocaleDateString("en-GB")}` : "",
            }));

        const projectResults = projects
            .filter((p) => (p.name || "").toLowerCase().includes(query))
            .map((p) => ({
                type: "project",
                id: p.id,
                label: p.name,
                meta: p.status || "",
            }));

        // simple ordering: tasks first, then projects
        return [...taskResults, ...projectResults].slice(0, 8);
    }, [q, tasks, projects]);

    const handleSelect = (item) => {
        if (item.type === "task") {
            nav("/tasks");       // just go to tasks page
        } else {
            nav(`/projects/${item.id}`);
        }

        setQ("");
        document.activeElement.blur();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setQ("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="search-container" ref={searchRef}>
            <form className="searchbar-form" onSubmit={(e) => e.preventDefault()}>
                <button type="submit" className="search-icon-btn">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>

                <input
                    className="searchbar-input"
                    type="search"
                    placeholder="Search tasks or projects..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />

                {q && results.length > 0 && (
                    <div className="task-search-results">
                        <ul>
                            {results.map((r) => (
                                <li key={`${r.type}-${r.id}`} onClick={() => handleSelect(r)}>
                                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                        <span>
                                            <strong style={{ opacity: 0.5, fontSize: "0.8rem", textTransform: "uppercase" }}>{r.type}</strong>
                                            <span style={{ marginLeft: "10px" }}>{r.label}</span>
                                        </span>
                                        {r.meta ? (
                                            <span style={{ opacity: 0.5, fontSize: 12 }}>{r.meta}</span>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {q && results.length === 0 && (
                    <div className="task-search-empty">No results found for "{q}"</div>
                )}
            </form>
        </div>
    );
}