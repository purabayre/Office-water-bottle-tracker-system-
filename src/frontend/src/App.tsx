import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MonthlyView from "./pages/MonthlyView";
import Settings from "./pages/Settings";
import { MdDashboard, MdCalendarMonth } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";

export default function App() {
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1>Office Hydration</h1>
        <p>MANAGEMENT PORTAL</p>
        <ul>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MdDashboard style={{ fontSize: "20px" }} />
              <span>DASHBOARD</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/monthly"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MdCalendarMonth style={{ fontSize: "20px" }} />
              <span>MONTHLY VIEW</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <IoMdSettings style={{ fontSize: "20px" }} />
              <span>SETTINGS</span>
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* Pages */}
      <main className="main">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monthly" element={<MonthlyView />} />
          <Route path="/settings" element={<Settings />} />
          {/* Default redirect */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}