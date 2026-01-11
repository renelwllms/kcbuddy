import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import { loginWithCode, registerFamily } from "../lib/api.js";

const initialForm = {
  familyName: "",
  parentName: "",
  email: "",
  code: ""
};

export default function AuthModal({ open, mode, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("form");

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialForm);
    setError("");
    setResult(null);
    setStatus("form");
  }, [open, mode]);

  const isSignup = mode === "signup";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (isSignup) {
        const response = await registerFamily({
          familyName: form.familyName.trim(),
          parentName: form.parentName.trim(),
          email: form.email.trim()
        });
        setResult(response);
        setStatus("success");
        onSuccess?.(response);
        return;
      }

      const response = await loginWithCode(form.code.trim());
      localStorage.setItem("kcbuddy_token", response.token);
      localStorage.setItem("kcbuddy_role", response.role);
      localStorage.setItem("kcbuddy_name", response.user?.name || "");
      setResult(response);
      setStatus("success");
      onSuccess?.(response);
    } catch (err) {
      setError("Something went wrong. Check your details and try again.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isSignup ? "Create a family account" : "Log in with a code"}
    >
      {status === "form" && (
        <form className="modal-form" onSubmit={handleSubmit}>
          {isSignup ? (
            <>
              <label className="field">
                Family name
                <input
                  type="text"
                  name="familyName"
                  value={form.familyName}
                  onChange={handleChange}
                  placeholder="Smith family"
                  required
                />
              </label>
              <label className="field">
                Parent name
                <input
                  type="text"
                  name="parentName"
                  value={form.parentName}
                  onChange={handleChange}
                  placeholder="Jamie"
                  required
                />
              </label>
              <label className="field">
                Email address
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jamie@example.com"
                  required
                />
              </label>
            </>
          ) : (
            <label className="field">
              Access code
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="KID-ABC123"
                required
              />
            </label>
          )}
          {error && <p className="notice error">{error}</p>}
          <div className="modal-actions">
            <button className="secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary" type="submit">
              {isSignup ? "Create account" : "Log in"}
            </button>
          </div>
        </form>
      )}
      {status === "success" && isSignup && result && (
        <div className="success-block">
          <p className="notice success">
            Family account created. Save these codes for your household.
          </p>
          <p className="notice">
            We emailed your family code and login details.
          </p>
          <div className="code-block">
            <strong>Family code</strong>
            <span>{result.family.familyCode}</span>
          </div>
          <div className="code-block">
            <strong>Parent login code</strong>
            <span>{result.parent.loginCode}</span>
          </div>
          <button className="primary" type="button" onClick={onClose}>
            Done
          </button>
        </div>
      )}
      {status === "success" && !isSignup && result && (
        <div className="success-block">
          <p className="notice success">Login successful.</p>
          <div className="code-block">
            <strong>Signed in as</strong>
            <span>{result.user?.name || "Account"}</span>
          </div>
          <button className="primary" type="button" onClick={onClose}>
            Continue
          </button>
        </div>
      )}
    </Modal>
  );
}
