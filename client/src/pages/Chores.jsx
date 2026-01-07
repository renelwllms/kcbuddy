import { useEffect, useState } from "react";
import {
  createChore,
  getChoresWithInactive,
  updateChore,
  updateChoreStatus
} from "../lib/api.js";

const emptyForm = { title: "", rewardAmount: "", category: "", description: "" };

export default function Chores() {
  const [chores, setChores] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const role = localStorage.getItem("kcbuddy_role");

  const loadChores = async () => {
    try {
      const response = await getChoresWithInactive();
      setChores(response.chores || []);
      setStatus({ type: "idle", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: "Log in to view chores." });
    }
  };

  useEffect(() => {
    loadChores();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (chore) => {
    setEditId(chore.id);
    setForm({
      title: chore.title || "",
      rewardAmount: chore.reward_amount ?? chore.rewardAmount ?? "",
      category: chore.category || "",
      description: chore.description || ""
    });
  };

  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });

    const payload = {
      title: form.title.trim(),
      rewardAmount: Number(form.rewardAmount),
      category: form.category.trim() || null,
      description: form.description.trim() || null
    };

    if (!payload.title || !payload.rewardAmount) {
      setStatus({ type: "error", message: "Enter a title and reward amount." });
      return;
    }

    try {
      if (editId) {
        const updated = await updateChore(editId, payload);
        setChores((prev) => prev.map((chore) => (chore.id === editId ? { ...chore, ...updated } : chore)));
        resetForm();
        setStatus({ type: "success", message: "Chore updated." });
        return;
      }

      const created = await createChore(payload);
      setChores((prev) => [created, ...prev]);
      setForm(emptyForm);
      setStatus({ type: "success", message: "Chore added." });
    } catch (err) {
      setStatus({ type: "error", message: "Unable to save chore. Check your login." });
    }
  };

  const handleToggle = async (chore) => {
    try {
      const updated = await updateChoreStatus(chore.id, !chore.active);
      setChores((prev) => prev.map((item) => (item.id === chore.id ? { ...item, ...updated } : item)));
    } catch (err) {
      setStatus({ type: "error", message: "Unable to update chore status." });
    }
  };

  return (
    <section className="content-section">
      <div className="section-heading">
        <p className="pill">Chores</p>
        <h2>Flexible chores with custom rewards</h2>
      </div>
      {role !== "parent" && (
        <p className="notice error">Only parents can create or edit chores.</p>
      )}
      <div className="split-grid">
        <div className="card">
          <h3>{editId ? "Edit chore" : "Add a chore"}</h3>
          <form className="modal-form" onSubmit={handleSubmit}>
            <label className="field">
              Chore title
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Vacuum lounge"
                required
                disabled={role !== "parent"}
              />
            </label>
            <label className="field">
              Reward amount (NZD)
              <input
                type="number"
                name="rewardAmount"
                value={form.rewardAmount}
                onChange={handleChange}
                min="0.5"
                step="0.5"
                placeholder="2"
                required
                disabled={role !== "parent"}
              />
            </label>
            <label className="field">
              Category (optional)
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Indoors"
                disabled={role !== "parent"}
              />
            </label>
            <label className="field">
              Description (optional)
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Remember the corners"
                disabled={role !== "parent"}
              />
            </label>
            {status.type === "error" && <p className="notice error">{status.message}</p>}
            {status.type === "success" && <p className="notice success">{status.message}</p>}
            <div className="inline-actions">
              {editId && (
                <button className="secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
              <button className="primary" type="submit" disabled={role !== "parent"}>
                {editId ? "Save changes" : "Create chore"}
              </button>
            </div>
          </form>
        </div>
        <div className="card accent">
          <h3>Current chores</h3>
          {chores.length === 0 ? (
            <p className="muted">No chores yet.</p>
          ) : (
            <ul className="list">
              {chores.map((chore) => (
                <li key={chore.id} className={!chore.active ? "dimmed" : ""}>
                  <div>
                    <strong>{chore.title}</strong>
                    <span>{chore.category || "Uncategorized"}</span>
                  </div>
                  <div className="inline-actions">
                    <span className="amount">${Number(chore.reward_amount).toFixed(2)}</span>
                    {role === "parent" && (
                      <>
                        <button className="secondary" type="button" onClick={() => handleEdit(chore)}>
                          Edit
                        </button>
                        <button className="ghost" type="button" onClick={() => handleToggle(chore)}>
                          {chore.active ? "Archive" : "Restore"}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}