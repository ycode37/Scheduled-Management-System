import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ onClose }) => {

    const getLinkClass = ({ isActive }) => (isActive ? "active" : "");

    return (
        <div className="side">
            <div className="side-top-row">
                <div className="logo-container">
                    <h3>Simpli<span>Task</span></h3>
                </div>
                {/* Close button visible only on mobile */}
                <button className="sidebar-close-btn" onClick={onClose} type="button" aria-label="Close menu">
                    <i className="ri-close-line"></i>
                </button>
            </div>
            <ul>
                <li>
                    <NavLink to="/dashboard" className={getLinkClass}>
                        <i className="ri-dashboard-line"></i> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/tasks" className={getLinkClass}>
                        <i className="ri-task-line"></i> My Tasks
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/projects" className={getLinkClass}>
                        <i className="ri-folder-line"></i> Projects
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/calendar" className={getLinkClass}>
                        <i className="ri-calendar-line"></i> Calendar
                    </NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;

