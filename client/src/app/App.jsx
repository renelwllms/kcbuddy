import { Routes, Route } from "react-router-dom";
import MarketingLayout from "./MarketingLayout.jsx";
import AppLayout from "./AppLayout.jsx";
import Home from "../pages/Home.jsx";
import Features from "../pages/Features.jsx";
import About from "../pages/About.jsx";
import Contact from "../pages/Contact.jsx";
import KidDashboard from "../pages/KidDashboard.jsx";
import ParentDashboard from "../pages/ParentDashboard.jsx";
import Chores from "../pages/Chores.jsx";
import Submissions from "../pages/Submissions.jsx";
import Goals from "../pages/Goals.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<ParentDashboard />} />
        <Route path="parent" element={<ParentDashboard />} />
        <Route path="kid" element={<KidDashboard />} />
        <Route path="chores" element={<Chores />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="goals" element={<Goals />} />
      </Route>
    </Routes>
  );
}