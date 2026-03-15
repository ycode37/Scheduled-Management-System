import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// css handled in Dashboard.css

export default function DashboardProjectsCard() {
    const statusClass = (s = "") => {
        const v = s.toLowerCase();
        if (v.includes("complete")) return "bg-green-100 text-green-700";
        if (v.includes("progress") || v.includes("ongoing")) return "bg-amber-100 text-amber-700";
        if (v.includes("not")) return "bg-red-100 text-red-700";
        return "bg-gray-100 text-gray-700";
    };

    const projects = useSelector((s) => s.projects.projects);
    const nav = useNavigate();

    const recentProjects = projects; 

    return (
        <div className="projects-card">
            <h2>Current <button onClick={() => nav("/projects")}>Directory</button></h2>

            <div className="projects-list">
                {recentProjects.length === 0 ? (
                    <p className="empty-state">No projects in directory.</p>
                ) : (
                    <ul>
                        {recentProjects.slice(0, 4).map((p) => {
                            const count = Number(p.task_count) || 0;

                            return (
                                <li
                                    key={p.id}
                                    onClick={() => nav(`/projects/${p.id}`)}
                                >
                                    <span className="name">{p.name}</span>
                                    <span className="count">{count}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}