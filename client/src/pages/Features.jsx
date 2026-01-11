import { useMemo } from "react";

const features = [
  {
    title: "Family accounts",
    text: "Each family gets its own isolated workspace with codes for every parent and child.",
    art: "/assets/feature-family.svg"
  },
  {
    title: "Custom chores + rewards",
    text: "Set variable reward amounts per chore and adjust as kids grow.",
    art: "/assets/feature-goals.svg"
  },
  {
    title: "Photo approvals",
    text: "Kids submit proof and parents approve before rewards are granted.",
    art: "/assets/feature-photo.svg"
  },
  {
    title: "Goal tracking",
    text: "Kids set savings goals and watch their progress rise with every approval.",
    art: "/assets/feature-goals.svg"
  },
  {
    title: "Weekly summaries",
    text: "Parents see weekly totals and pending approvals at a glance.",
    art: "/assets/feature-family.svg"
  },
  {
    title: "Kid-friendly personalization",
    text: "Choose avatars, upload photos, and make the app feel like home.",
    art: "/assets/feature-photo.svg"
  }
];

export default function Features() {
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
      },
      {
        question: "Do parents and kids have separate access?",
        answer:
          "Yes. Parents manage chores and approvals, while kids see their assigned chores, submissions, and goal progress."
      },
      {
        question: "Can multiple parents or caregivers manage the same family?",
        answer:
          "Yes. A family can have multiple parent logins so caregivers can share chores and approvals."
      },
      {
        question: "Can I view weekly progress or summaries?",
        answer:
          "Yes. Parents can view weekly totals and pending approvals to quickly see what’s completed and what needs review."
      },
      {
        question: "Is KCBuddy safe for kids to use?",
        answer:
          "KCBuddy uses family and profile access controls so kids only see their own chores and progress within their family workspace."
      }
    ],
    []
  );

  return (
    <>
      <section className="content-section features-intro">
        <p className="pill">What families get</p>
        <h1 className="page-title">KCBuddy Features</h1>
        <p className="definition">
          KCBuddy is a family chore management web app that helps parents assign chores, review
          photo proof, and reward kids while tracking goals.
        </p>
        <p className="definition detail">
          It's built for busy families who want a simple system for responsibilities and rewards.
          Parents manage chores and approvals, and kids can see progress toward savings or reward
          goals.
        </p>
      </section>
      <section className="features">
        <div className="section-heading">
          <h2>Built for busy parents. Designed for curious kids.</h2>
          <p>
            Everything in KCBuddy is focused on clarity, encouragement, and celebrating effort.
          </p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <img src={feature.art} alt="" loading="lazy" />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="content-section how-it-works">
        <h2>How it works</h2>
        <div className="split-grid">
          <div className="card">
            <h3>Parents create chores</h3>
            <p>Set tasks with reward amounts and assign them to each child.</p>
          </div>
          <div className="card">
            <h3>Kids submit proof</h3>
            <p>Children complete chores and upload a photo for approval.</p>
          </div>
          <div className="card">
            <h3>Parents approve rewards</h3>
            <p>Approvals grant rewards and update progress toward goals.</p>
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
