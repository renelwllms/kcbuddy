import { Link, Outlet, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" }
];

export default function MarketingLayout() {
  const location = useLocation();

  return (
    <div className="page marketing">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">KC</span>
          <div>
            <div className="brand-title">KCBuddy</div>
            <div className="brand-sub">KiwiChore Buddy</div>
          </div>
        </div>
        <nav className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
          <Link className="cta" to="/app">Open App</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div>Made for Kiwi families • KCBuddy</div>
        <Link className="footer-link" to="/contact">Contact</Link>
      </footer>
    </div>
  );
}