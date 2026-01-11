import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithCode } from "../lib/api.js";
import { readSession, saveSession } from "../lib/session.js";
import { enableAppPwa, onInstallPromptReady, promptInstall } from "../app/pwa.js";

export default function Login() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    enableAppPwa();
    const unsubscribe = onInstallPromptReady(setCanInstall);
    const existing = readSession();
    if (existing) {
      navigate("/app", { replace: true });
    }
    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const response = await loginWithCode(code.trim());
      const session = saveSession(response);
      const target = session?.role === "kid" ? "/app/kid" : "/app/parent";
      navigate(target, { replace: true });
    } catch (err) {
      setStatus("idle");
      setError("That code did not work. Check the letters and try again.");
    }
  };

  const handleInstall = async () => {
    await promptInstall();
  };

  return (
    <div className="page login-shell">
      <header className="app-header login-header">
        <div className="brand compact">
          <span className="brand-mark">KC</span>
          <div>
            <div className="brand-title">KCBuddy</div>
            <div className="brand-sub">Chores + Goals</div>
          </div>
        </div>
        <div className="app-actions">
          <Link className="ghost" to="/">Back to Marketing</Link>
        </div>
      </header>
      <main className="login-main">
        <section className="login-hero">
          <div className="login-copy">
            <p className="pill">Family codes keep kids safe</p>
            <h1>Welcome back, team!</h1>
            <p className="lead">
              Enter your family or kid login code to open your chore dashboard.
              Parent codes unlock approvals and setup tools.
            </p>
            <div className="login-highlights">
              <div>
                <strong>Kid friendly</strong>
                <span>Simple screens and big buttons.</span>
              </div>
              <div>
                <strong>Quick access</strong>
                <span>No passwords for kids.</span>
              </div>
              <div>
                <strong>Safe by design</strong>
                <span>Each family has private codes.</span>
              </div>
            </div>
          </div>
          <div className="login-card">
            <div className="login-card-header">
              <h2>Log in with a code</h2>
              <p className="muted">Example: PAR-3F29A1 or KID-92BB10</p>
            </div>
            <form className="login-form" onSubmit={handleSubmit}>
              <label className="field">
                Access code
                <input
                  type="text"
                  name="code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="KID-ABC123"
                  required
                />
              </label>
              {error && <p className="notice error">{error}</p>}
              <button className="primary full" type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Checking code..." : "Open dashboard"}
              </button>
            </form>
            <div className="login-help">
              <p className="muted">
                Need a family code? Ask a parent or create one on the marketing site.
              </p>
              <Link className="secondary" to="/">Create family account</Link>
              {canInstall && (
                <button className="ghost full" type="button" onClick={handleInstall}>
                  Install the KCBuddy app
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
