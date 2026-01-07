import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import AuthModal from "../components/AuthModal.jsx";

function readSession() {
  const role = localStorage.getItem("kcbuddy_role");
  if (!role) {
    return null;
  }

  return {
    role,
    name: localStorage.getItem("kcbuddy_name") || ""
  };
}

export default function AppLayout() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [session, setSession] = useState(() => readSession());

  const handleLogout = () => {
    localStorage.removeItem("kcbuddy_token");
    localStorage.removeItem("kcbuddy_role");
    localStorage.removeItem("kcbuddy_name");
    setSession(null);
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
          {session ? (
            <div className="session-pill">
              <span>
                Signed in: {session.role} {session.name ? `(${session.name})` : ""}
              </span>
              <button className="secondary" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <button className="primary" onClick={() => setLoginOpen(true)}>
              Log in with Code
            </button>
          )}
          <Link className="ghost" to="/">Marketing Site</Link>
        </div>
      </header>
      <div className="app-body">
        <aside className="side-nav">
          <NavLink to="/app/parent">Parent View</NavLink>
          <NavLink to="/app/kid">Kid View</NavLink>
          <NavLink to="/app/chores">Chores</NavLink>
          <NavLink to="/app/submissions">Approvals</NavLink>
          <NavLink to="/app/goals">Goals</NavLink>
        </aside>
        <section className="content">
          <Outlet />
        </section>
      </div>
      <AuthModal
        open={loginOpen}
        mode="login"
        onClose={() => setLoginOpen(false)}
        onSuccess={() => setSession(readSession())}
      />
    </div>
  );
}