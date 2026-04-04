import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "../styles/globals.css";

import { fetchTasks } from "../features/tasks/tasksSlice";
import { fetchProjects } from "../features/projects/projectsSlice";
import { useAuth } from "../auth/AuthContext";

const AppShell = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const location = useLocation();

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchTasks());
    dispatch(fetchProjects());
  }, [dispatch, user]);

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className="shell">
      <div className="main-layout">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>

        <div className="main">
          <header className="topbar">
            <TopBar onMenuToggle={() => setSidebarOpen((v) => !v)} />
          </header>

          <main className="content">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;

