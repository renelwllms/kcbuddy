import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal.jsx";

export default function Home() {
  const [signupOpen, setSignupOpen] = useState(false);
  const navigate = useNavigate();
  const faqItems = useMemo(
    () => [
      {
        question: "How does KCBuddy work?",
        answer:
          "Parents create chores with reward amounts, kids submit completed chores, and parents approve to grant rewards and update progress."
      },
      {
        question: "Who is KCBuddy for?",
        answer:
          "KCBuddy is for families who want an easy way to manage chores, teach responsibility, and motivate kids with rewards and goals."
      },
      {
        question: "Can multiple children use one family account?",
        answer:
          "Yes. Each child can have its own profile, so chores and progress are tracked per kid."
      },
      {
        question: "How do photo approvals work?",
        answer:
          "Kids submit a photo with a completed chore, and parents approve or reject it before any reward is granted."
      },
      {
        question: "Can I set different reward amounts per chore?",
        answer:
          "Yes. Each chore can have its own reward amount, and you can adjust rewards at any time."
      },
      {
        question: "Does KCBuddy support goal tracking?",
        answer:
          "Yes. Kids can set goals and track progress as chores are approved and rewards accumulate."
      },
      {
        question: "What devices can we use for KCBuddy?",
        answer:
          "KCBuddy is web-based, so it works on phones, tablets, and computers with a modern browser."
      },
      {
        question: "How do we get started with KCBuddy?",
        answer:
          "Create a family workspace, add kid profiles, create chores and rewards, and start submitting and approving chores."
      }
    ],
    []
  );

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="pill">Chores - Rewards - Savings Goals</p>
          <h1>KCBuddy — KiwiChore Buddy</h1>
          <p className="definition">
            KCBuddy is a family chore management web app that helps parents assign chores, review
            photo proof, and reward kids while tracking goals.
          </p>
          <p className="definition detail">
            It's built for busy families who want a simple system for responsibilities and
            rewards. Parents manage chores and approvals, and kids can see progress toward savings
            or reward goals.
          </p>
          <ul className="benefit-list">
            <li>
              <strong>Clarity</strong>
              <span>One place to assign chores and see what is completed.</span>
            </li>
            <li>
              <strong>Rewards</strong>
              <span>Flexible reward amounts motivate kids with real progress.</span>
            </li>
            <li>
              <strong>Goals</strong>
              <span>Kids track savings or reward goals as approvals roll in.</span>
            </li>
          </ul>
          <p className="lead">
            KCBuddy helps parents assign meaningful chores, approve photo proof, and reward progress
            toward savings goals. Built for busy Kiwi families who want structure without stress.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => navigate("/app")}>
              Open App
            </button>
            <button className="secondary" onClick={() => setSignupOpen(true)}>
              Create Family Account
            </button>
            <button className="ghost" onClick={() => navigate("/features")}>
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
        <div className="hero-visuals">
          <img
            className="hero-scene"
            src="/assets/kcbhomepage.png"
            alt="Family using KCBuddy together"
          />
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
        </div>
        <AuthModal open={signupOpen} mode="signup" onClose={() => setSignupOpen(false)} />
      </section>
      <section className="content-section overview">
        <h2>Short features overview</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Assign chores fast</h3>
            <p>Create custom chores, set reward amounts, and update tasks in seconds.</p>
          </div>
          <div className="feature-card">
            <h3>Approve with confidence</h3>
            <p>Photo proof keeps approvals simple and keeps kids accountable.</p>
          </div>
          <div className="feature-card">
            <h3>Track goal progress</h3>
            <p>See reward totals climb toward savings or family goals.</p>
          </div>
        </div>
      </section>
      <section className="faq-section">
        <h2>Frequently asked questions</h2>
        <div className="faq-grid">
          {faqItems.map((item) => (
            <div key={item.question} className="card faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
