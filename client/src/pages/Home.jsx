import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal.jsx";

export default function Home() {
  const [signupOpen, setSignupOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-text">
        <p className="pill">Chores - Rewards - Savings Goals</p>
        <h1>Teach responsibility with a system kids actually enjoy using.</h1>
        <p className="lead">
          KCBuddy helps parents assign meaningful chores, approve photo proof,
          and reward progress toward savings goals. Built for busy Kiwi
          families who want structure without stress.
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={() => setSignupOpen(true)}>
            Create Family Account
          </button>
          <button className="secondary" onClick={() => navigate("/features")}>
            See Features
          </button>
        </div>
        <div className="hero-stats">
          <div>
            <strong>Multi-family</strong>
            <span>Strict data isolation</span>
          </div>
          <div>
            <strong>Code login</strong>
            <span>No email for kids</span>
          </div>
          <div>
            <strong>Photo proof</strong>
            <span>Parents approve rewards</span>
          </div>
        </div>
      </div>
      <div className="hero-card">
        <div className="card-header">Today in the household</div>
        <ul>
          <li>
            <span>Vacuum lounge</span>
            <span>$2.00</span>
          </li>
          <li>
            <span>Weed the garden</span>
            <span>$5.00</span>
          </li>
          <li>
            <span>Wash the car</span>
            <span>$8.00</span>
          </li>
        </ul>
        <div className="card-footer">3 approvals waiting</div>
      </div>
      <AuthModal open={signupOpen} mode="signup" onClose={() => setSignupOpen(false)} />
    </section>
  );
}