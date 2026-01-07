import { useEffect, useState } from "react";
import { decideSubmission, getSubmissions } from "../lib/api.js";

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const role = localStorage.getItem("kcbuddy_role");

  const loadSubmissions = async () => {
    try {
      const response = await getSubmissions();
      setSubmissions(response.submissions || []);
      setStatus({ type: "idle", message: "" });
    } catch (err) {
      setStatus({
        type: "error",
        message: role === "kid" ? "Log in to view your submissions." : "Log in as a parent to review submissions."
      });
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleDecision = async (id, decision) => {
    try {
      await decideSubmission(id, decision);
      await loadSubmissions();
    } catch (err) {
      setStatus({ type: "error", message: "Unable to update submission." });
    }
  };

  return (
    <section className="content-section">
      <div className="section-heading">
        <p className="pill">Approvals</p>
        <h2>{role === "kid" ? "My submissions" : "Review photo submissions"}</h2>
      </div>
      {status.type === "error" && <p className="notice error">{status.message}</p>}
      <div className="card">
        {submissions.length === 0 ? (
          <p className="muted">No submissions yet.</p>
        ) : (
          <ul className="list">
            {submissions.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{role === "kid" ? "You" : item.kid_name || "Kid"}</strong>
                  <span>{item.title}</span>
                  <span>Status: {item.status}</span>
                  {item.photo_url && (
                    <a href={item.photo_url} target="_blank" rel="noreferrer">
                      View photo
                    </a>
                  )}
                </div>
                <div className="approval-actions">
                  <span className="amount">${Number(item.reward_amount).toFixed(2)}</span>
                  {role === "parent" && (
                    <>
                      <button
                        className="secondary"
                        type="button"
                        onClick={() => handleDecision(item.id, "reject")}
                      >
                        Reject
                      </button>
                      <button
                        className="primary"
                        type="button"
                        onClick={() => handleDecision(item.id, "approve")}
                      >
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
