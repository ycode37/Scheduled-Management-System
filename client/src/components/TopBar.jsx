import "./TopBar.css";
import Searchbar from "./Searchbar";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const TopBar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="top">
      {/* Hamburger button - visible on mobile only */}
      <button className="hamburger-btn" onClick={onMenuToggle} type="button" aria-label="Open menu">
        <i className="ri-menu-line"></i>
      </button>

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