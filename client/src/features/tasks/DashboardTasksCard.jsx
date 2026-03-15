import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function DashboardTasksCard() {
    const max = 20;

    const tasks = useSelector((s) => s.tasks.tasks);
    const nav = useNavigate();

    const upcomingTasks = useMemo(() => {
        return [...tasks]
            // only tasks with a due date and not completed
            .filter((t) => t.due_date && Number(t.progress) < 100)
            // soonest first
            .sort((a, b) => +new Date(a.due_date) - +new Date(b.due_date))

    }, [tasks]);

    const statusFromProgress = (p = 0) =>
        p >= 100 ? "Complete" : p > 0 ? "Ongoing" : "Todo";

    const handleTaskClick = () => {
        nav("/tasks");
    };

    return (
        <div className="tasks-card">
            <h2>Upcoming <button onClick={() => nav("/tasks")}>View All</button></h2>

            {upcomingTasks.length === 0 ? (
                <p className="empty-state">No upcoming work scheduled.</p>
            ) : (
                <div className="tasks-list">
                    <ul>
                        {upcomingTasks.slice(0, 5).map((t) => (
                            <li key={t.id} onClick={handleTaskClick}>
                                <div className="checkbox"></div>
                                <div className="task-info">
                                    <span className="name">{t.title}</span>
                                    <span className="task-meta">
                                        {new Date(t.due_date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}