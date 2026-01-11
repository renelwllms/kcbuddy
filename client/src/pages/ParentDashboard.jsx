import { useEffect, useMemo, useState } from "react";
import { createKid, getKids, getSubmissions, updateKid } from "../lib/api.js";

const emptyForm = { name: "", goalAmount: "" };

export default function ParentDashboard() {
  const [kids, setKids] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editKidId, setEditKidId] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const loadKids = async () => {
    try {
      const response = await getKids();
      const submissionsResponse = await getSubmissions();
      setKids(response.kids || []);
      setSubmissions(submissionsResponse.submissions || []);
      setStatus({ type: "idle", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: "Log in as a parent to manage kids." });
    }
  };

  useEffect(() => {
    loadKids();
  }, []);

  const chartData = useMemo(() => {
    return kids.map((kid) => {
      const kidSubs = submissions.filter((item) => item.kid_id === kid.id);
      const approved = kidSubs.filter((item) => item.status === "approved");
      const pending = kidSubs.filter((item) => item.status === "pending");
      const approvedTotal = approved.reduce((sum, item) => sum + Number(item.reward_amount || 0), 0);
      const pendingTotal = pending.reduce((sum, item) => sum + Number(item.reward_amount || 0), 0);
      const weeklyTotal = approved.reduce((sum, item) => {
        const approvedAt = item.approved_at || item.created_at;
        if (!approvedAt) {
          return sum;
        }
        const deltaDays = (Date.now() - new Date(approvedAt).getTime()) / (1000 * 60 * 60 * 24);
        return deltaDays <= 7 ? sum + Number(item.reward_amount || 0) : sum;
      }, 0);
      return { kid, approvedTotal, pendingTotal, weeklyTotal };
    });
  }, [kids, submissions]);

  const maxApproved = Math.max(1, ...chartData.map((row) => row.approvedTotal));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (kid) => {
    setEditKidId(kid.id);
    setForm({
      name: kid.name || "",
      goalAmount: kid.goal_amount ?? kid.goalAmount ?? ""
    });
    setStatus({ type: "idle", message: "" });
  };

  const resetForm = () => {
    setEditKidId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });

    try {
      const payload = {
        name: form.name.trim(),
        goalAmount: form.goalAmount ? Number(form.goalAmount) : null
      };

      if (editKidId) {
        const updated = await updateKid(editKidId, payload);
        setKids((prev) =>
          prev.map((kid) => (kid.id === editKidId ? { ...kid, ...updated } : kid))
        );
        resetForm();
        setStatus({ type: "success", message: "Kid updated." });
        return;
      }

      const created = await createKid(payload);
      setKids((prev) => [created, ...prev]);
      setForm(emptyForm);
      setStatus({ type: "success", message: "Kid added. Share their login code." });
    } catch (err) {
      setStatus({ type: "error", message: "Unable to save changes. Check your login." });
    }
  };

  return (
    <section className="content-section">
      <div className="section-heading">
        <p className="pill">Parent view</p>
        <h2>Add kids and manage household access</h2>
      </div>
      <div className="split-grid">
        <div className="card">
          <h3>{editKidId ? "Edit kid" : "Add a kid"}</h3>
          <form className="modal-form" onSubmit={handleSubmit}>
            <label className="field">
              Kid name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ava"
                required
              />
            </label>
            <label className="field">
              Savings goal (NZD)
              <input
                type="number"
                name="goalAmount"
                value={form.goalAmount}
                onChange={handleChange}
                min="1"
                placeholder="100"
              />
            </label>
            {status.type === "error" && <p className="notice error">{status.message}</p>}
            {status.type === "success" && <p className="notice success">{status.message}</p>}
            <div className="inline-actions">
              {editKidId && (
                <button className="secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
              <button className="primary" type="submit">
                {editKidId ? "Save changes" : "Create kid login code"}
              </button>
            </div>
          </form>
        </div>
        <div className="card accent">
          <h3>Active kids</h3>
          {kids.length === 0 ? (
            <p className="muted">No kids yet. Add your first child to create a login code.</p>
          ) : (
            <ul className="list">
              {kids.map((kid) => (
                <li key={kid.id}>
                  <div>
                    <strong>{kid.name}</strong>
                    <span>
                      Login code: {kid.loginCode || "Hidden (shown on creation only)"}
                    </span>
                  </div>
                  <div className="inline-actions">
                    <span className="amount">
                      {kid.goal_amount || kid.goalAmount
                        ? `$${Number(kid.goal_amount || kid.goalAmount).toFixed(2)}`
                        : "No goal"}
                    </span>
                    <button className="secondary" type="button" onClick={() => handleEdit(kid)}>
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="card">
        <h3>Kid progress snapshot</h3>
        {chartData.length === 0 ? (
          <p className="muted">No progress yet. Add a kid and approve some chores.</p>
        ) : (
          <div className="chart">
            {chartData.map((row) => (
              <div key={row.kid.id} className="chart-row">
                <div className="chart-label">
                  <strong>{row.kid.name}</strong>
                  <span>${row.weeklyTotal.toFixed(2)} this week</span>
                </div>
                <div className="chart-bar">
                  <div
                    className="chart-fill"
                    style={{ width: `${(row.approvedTotal / maxApproved) * 100}%` }}
                  />
                </div>
                <div className="chart-values">
                  <span>Approved: ${row.approvedTotal.toFixed(2)}</span>
                  <span>Pending: ${row.pendingTotal.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
