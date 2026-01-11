import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession } from "../lib/session.js";
import { enableAppPwa } from "./pwa.js";

export default function AppLayout({ session }) {
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState(session);

  useEffect(() => {
    enableAppPwa();
  }, []);

  const navLinks = useMemo(() => {
    if (currentSession?.role === "kid") {
      return [
        { to: "/app/kid", label: "Kid View" },
        { to: "/app/goals", label: "Goals" }
      ];
    }

    return [
      { to: "/app/parent", label: "Parent View" },
      { to: "/app/kid", label: "Kid View" },
      { to: "/app/chores", label: "Chores" },
      { to: "/app/submissions", label: "Approvals" },
      { to: "/app/goals", label: "Goals" }
    ];
  }, [currentSession?.role]);

  const handleLogout = () => {
    clearSession();
    setCurrentSession(null);
    navigate("/app/login", { replace: true });
  };

  return (
    <div className="page app-shell">
      <header className="app-header">
        <div className="brand compact">
          <span className="brand-mark">KC</span>
          <div>
            <div className="brand-title">KCBuddy</div>
            <div className="brand-sub">Chores + Goals</div>
          </div>
        </div>
        <div className="app-actions">
          <div className="session-pill">
            <span>
              Signed in: {currentSession?.role}{" "}
              {currentSession?.name ? `(${currentSession.name})` : ""}
            </span>
            <button className="secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
          <Link className="ghost" to="/">Marketing Site</Link>
        </div>
      </header>
      <div className="app-body">
        <aside className="side-nav">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </aside>
        <section className="content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
