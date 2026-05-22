import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <h2 className="sid-h2">Office Hydration</h2>
        <p>MANAGMENT PORTA</p>
      </div>

      <nav className="nav-links">
        <NavLink to="/" className="nav-link">
          Dashboard
        </NavLink>

        <NavLink to="/monthly" className="nav-link">
          Monthly View
        </NavLink>

        <NavLink to="/settings" className="nav-link">
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;