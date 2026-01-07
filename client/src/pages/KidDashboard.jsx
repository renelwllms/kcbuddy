import { useEffect, useMemo, useState } from "react";
import {
  createSubmission,
  getChores,
  getKidGoal,
  getKids,
  getSubmissions,
  uploadPhotoLocal
} from "../lib/api.js";

export default function KidDashboard() {
  const [chores, setChores] = useState([]);
  const [goalAmount, setGoalAmount] = useState(null);
  const [kids, setKids] = useState([]);
  const [selectedKidId, setSelectedKidId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [uploadStatus, setUploadStatus] = useState({ type: "idle", message: "" });
  const [selectedChoreId, setSelectedChoreId] = useState("");
  const [file, setFile] = useState(null);

  const role = localStorage.getItem("kcbuddy_role");
  const name = localStorage.getItem("kcbuddy_name") || "Kid";

  const loadSubmissions = async () => {
    const submissionsResponse = await getSubmissions();
    setSubmissions(submissionsResponse.submissions || []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const choresResponse = await getChores();
        setChores(choresResponse.chores || []);

        if (role === "parent") {
          const kidsResponse = await getKids();
          await loadSubmissions();
          setKids(kidsResponse.kids || []);
          if (kidsResponse.kids && kidsResponse.kids.length > 0) {
            setSelectedKidId(kidsResponse.kids[0].id);
          }
        } else {
          const goalResponse = await getKidGoal();
          await loadSubmissions();
          setGoalAmount(goalResponse.goalAmount || null);
        }

        setStatus({ type: "idle", message: "" });
      } catch (err) {
        setStatus({ type: "error", message: "Log in to see kid view." });
      }
    };

    load();
  }, [role]);

  const selectedKid = useMemo(() => {
    if (role !== "parent") {
      return null;
    }
    return kids.find((kid) => kid.id === selectedKidId) || null;
  }, [kids, role, selectedKidId]);

  const target = role === "parent" ? selectedKid?.goal_amount || selectedKid?.goalAmount || 0 : goalAmount || 0;

  const filteredSubmissions = useMemo(() => {
    if (role === "parent") {
      if (!selectedKidId) {
        return [];
      }
      return submissions.filter((item) => item.kid_id === selectedKidId);
    }
    return submissions;
  }, [role, selectedKidId, submissions]);

  const approvedSubmissions = filteredSubmissions.filter((item) => item.status === "approved");
  const pendingSubmissions = filteredSubmissions.filter((item) => item.status === "pending");

  const approvedTotal = approvedSubmissions.reduce((sum, item) => sum + Number(item.reward_amount || 0), 0);
  const pendingTotal = pendingSubmissions.reduce((sum, item) => sum + Number(item.reward_amount || 0), 0);

  const weeklyTotal = approvedSubmissions.reduce((sum, item) => {
    const approvedAt = item.approved_at || item.created_at;
    if (!approvedAt) {
      return sum;
    }
    const deltaDays = (Date.now() - new Date(approvedAt).getTime()) / (1000 * 60 * 60 * 24);
    return deltaDays <= 7 ? sum + Number(item.reward_amount || 0) : sum;
  }, 0);

  const progress = target ? Math.min((approvedTotal / target) * 100, 100) : 0;

  const handleUpload = async (event) => {
    event.preventDefault();
    setUploadStatus({ type: "idle", message: "" });

    if (role !== "kid") {
      setUploadStatus({ type: "error", message: "Only kids can submit photos." });
      return;
    }

    if (!selectedChoreId) {
      setUploadStatus({ type: "error", message: "Choose a chore first." });
      return;
    }

    if (!file) {
      setUploadStatus({ type: "error", message: "Choose a photo to upload." });
      return;
    }

    try {
      const upload = await uploadPhotoLocal(file);
      await createSubmission({ choreId: selectedChoreId, photoUrl: upload.photoUrl });
      setUploadStatus({ type: "success", message: "Submitted for approval." });
      setSelectedChoreId("");
      setFile(null);
      await loadSubmissions();
    } catch (err) {
      setUploadStatus({ type: "error", message: "Upload failed. Check storage settings." });
    }
  };

  return (
    <section className="content-section">
      <div className="section-heading">
        <p className="pill">Kid view</p>
        <h2>
          {role === "parent" && selectedKid
            ? `Viewing ${selectedKid.name}'s view`
            : `Hi, ${name}! Ready for your next mission?`}
        </h2>
      </div>
      {status.type === "error" && <p className="notice error">{status.message}</p>}
      {role === "parent" && (
        <div className="card">
          <label className="field">
            Choose a kid to preview
            <select
              value={selectedKidId}
              onChange={(event) => setSelectedKidId(event.target.value)}
            >
              {kids.length === 0 && <option value="">No kids yet</option>}
              {kids.map((kid) => (
                <option key={kid.id} value={kid.id}>
                  {kid.name}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            Parents can preview each kid view. Kids only see their own data when logged in.
          </p>
        </div>
      )}
      <div className="split-grid">
        <div className="card">
          <h3>My chores</h3>
          {chores.length === 0 ? (
            <p className="muted">No chores yet. Ask a parent to add some.</p>
          ) : (
            <ul className="list">
              {chores.map((chore) => (
                <li key={chore.id}>
                  <div>
                    <strong>{chore.title}</strong>
                    <span>Photo proof required</span>
                  </div>
                  <div className="amount">${Number(chore.reward_amount).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card accent">
          <h3>Goal progress</h3>
          {target ? (
            <>
              <p className="stat">${approvedTotal.toFixed(2)} / ${Number(target).toFixed(2)}</p>
              <div className="progress">
                <span style={{ width: `${progress}%` }} />
              </div>
              <p className="muted">Keep going - you are ${Number(target - approvedTotal).toFixed(2)} away.</p>
              <div className="stats-grid">
                <div>
                  <strong>${weeklyTotal.toFixed(2)}</strong>
                  <span>This week</span>
                </div>
                <div>
                  <strong>${pendingTotal.toFixed(2)}</strong>
                  <span>Pending</span>
                </div>
              </div>
            </>
          ) : (
            <p className="muted">No goal set yet. Set one from the Goals tab.</p>
          )}
        </div>
      </div>
      <div className="card">
        <h3>Submit a photo</h3>
        {role !== "kid" ? (
          <p className="muted">Only kids can submit photo proof.</p>
        ) : (
          <form className="modal-form" onSubmit={handleUpload}>
            <label className="field">
              Chore
              <select value={selectedChoreId} onChange={(event) => setSelectedChoreId(event.target.value)}>
                <option value="">Choose a chore</option>
                {chores.map((chore) => (
                  <option key={chore.id} value={chore.id}>
                    {chore.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Photo
              <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </label>
            {uploadStatus.type === "error" && <p className="notice error">{uploadStatus.message}</p>}
            {uploadStatus.type === "success" && <p className="notice success">{uploadStatus.message}</p>}
            <button className="primary" type="submit">
              Submit for approval
            </button>
          </form>
        )}
      </div>
    </section>
  );
}