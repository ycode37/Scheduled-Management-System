import { useEffect } from "react";
import { useDispatch } from "react-redux";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "../styles/globals.css";

import { fetchTasks } from "../features/tasks/tasksSlice";
import { fetchProjects } from "../features/projects/projectsSlice";
import { useAuth } from "../auth/AuthContext";

const AppShell = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return; // only fetch when logged in
    dispatch(fetchTasks());
    dispatch(fetchProjects());
  }, [dispatch, user]);

  return (
    <div className="shell">
      <div className="main-layout">
        <aside className="sidebar">
          <Sidebar />
        </aside>

        <div className="main">
          <header className="topbar">
            <TopBar />
          </header>

          <main className="content">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
