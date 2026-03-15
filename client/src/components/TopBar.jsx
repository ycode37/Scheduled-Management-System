import "./TopBar.css";
import Searchbar from "./Searchbar";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // Optional fallback if user isn't loaded yet
  if (!user) return null;

  console.log("TopBar user:", user);

  return (
    <div className="top">
      <div className="search-container">
        <Searchbar />
      </div>

      <div className="profile">
        <span>{user.username}</span>
        <div className="avatar">
          {user.username?.[0]?.toUpperCase()}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default TopBar;