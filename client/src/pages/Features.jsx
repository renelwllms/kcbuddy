import familyArt from "../assets/feature-family.svg";
import photoArt from "../assets/feature-photo.svg";
import goalsArt from "../assets/feature-goals.svg";

const features = [
  {
    title: "Family accounts",
    text: "Each family gets its own isolated workspace with codes for every parent and child.",
    art: familyArt
  },
  {
    title: "Custom chores + rewards",
    text: "Set variable reward amounts per chore and adjust as kids grow.",
    art: goalsArt
  },
  {
    title: "Photo approvals",
    text: "Kids submit proof and parents approve before rewards are granted.",
    art: photoArt
  },
  {
    title: "Goal tracking",
    text: "Kids set savings goals and watch their progress rise with every approval.",
    art: goalsArt
  },
  {
    title: "Weekly summaries",
    text: "Parents see weekly totals and pending approvals at a glance.",
    art: familyArt
  },
  {
    title: "Kid-friendly personalization",
    text: "Choose avatars, upload photos, and make the app feel like home.",
    art: photoArt
  }
];

export default function Features() {
  return (
    <section className="features">
      <div className="section-heading">
        <p className="pill">What families get</p>
        <h2>Built for busy parents. Designed for curious kids.</h2>
        <p>
          Everything in KCBuddy is focused on clarity, encouragement, and
          celebrating effort.
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
  );
}
