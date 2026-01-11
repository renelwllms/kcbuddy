import { Route } from "react-router-dom";
import MarketingLayout from "./MarketingLayout.jsx";
import Home from "../pages/Home.jsx";
import Features from "../pages/Features.jsx";
import About from "../pages/About.jsx";
import Contact from "../pages/Contact.jsx";

const marketingRoutes = (
  <Route element={<MarketingLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/features" element={<Features />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
  </Route>
);

export default marketingRoutes;
export { marketingRoutes };
