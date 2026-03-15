import "./Dashboard.css";
import DashboardTasksCard from "../tasks/DashboardTasksCard";
import DashboardProjectsCard from "../projects/DashboardProjectsCard";
import DashboardCalendar from "../calendar/DashboardCalendar";

export default function Dashboard() {
  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header smooth-entry">
        <h1>Work <span className="serif">Overview</span></h1>
      </header>
      
      <div className="stagger">
        <div className="upper">
          <DashboardTasksCard />
          <DashboardProjectsCard />
        </div>
        <div className="lower">
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
}
