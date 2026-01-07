import { useEffect, useState } from "react";
import { getKidGoal, updateKidGoal } from "../lib/api.js";

export default function Goals() {
  const [goalAmount, setGoalAmount] = useState("");
  const [currentGoal, setCurrentGoal] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const role = localStorage.getItem("kcbuddy_role");

  useEffect(() => {
    if (role !== "kid") {
      return;
    }

    const loadGoal = async () => {
      try {
        const response = await getKidGoal();
        setCurrentGoal(response.goalAmount || null);
        setStatus({ type: "idle", message: "" });
      } catch (err) {
        setStatus({ type: "error", message: "Log in with a kid code to manage goals." });
      }
    };

    loadGoal();
  }, [role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });

    const value = Number(goalAmount);
    if (!value || value <= 0) {
      setStatus({ type: "error", message: "Enter a valid goal amount." });
      return;
    }

    try {
      const response = await updateKidGoal(value);
      setCurrentGoal(response.goalAmount);
      setGoalAmount("");
      setStatus({ type: "success", message: "Goal updated." });
    } catch (err) {
      setStatus({ type: "error", message: "Unable to update goal." });
    }
  };

  return (
    <section className="content-section">
      <div className="section-heading">
        <p className="pill">Goals</p>
        <h2>Savings goals and progress</h2>
      </div>
      {role !== "kid" && (
        <p className="notice error">Only kids can set their own goals. Parents can edit goals on the Parent view.</p>
      )}
      <div className="split-grid">
        <div className="card">
          <h3>Set a new goal</h3>
          <form className="modal-form" onSubmit={handleSubmit}>
            <label className="field">
              Target amount (NZD)
              <input
                type="number"
                min="1"
                value={goalAmount}
                onChange={(event) => setGoalAmount(event.target.value)}
                placeholder="100"
                disabled={role !== "kid"}
              />
            </label>
            {status.type === "error" && <p className="notice error">{status.message}</p>}
            {status.type === "success" && <p className="notice success">{status.message}</p>}
            <button className="primary" type="submit" disabled={role !== "kid"}>
              Save goal
            </button>
          </form>
        </div>
        <div className="card accent">
          <h3>Current goal</h3>
          {currentGoal ? (
            <p className="stat">$0.00 / ${Number(currentGoal).toFixed(2)}</p>
          ) : (
            <p className="muted">No goal set yet.</p>
          )}
          {status.type === "error" && <p className="muted">Log in as a kid to set a goal.</p>}
        </div>
      </div>
    </section>
  );
}