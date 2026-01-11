import { Routes } from "react-router-dom";
import marketingRoutes from "./MarketingRoutes.jsx";

export default function MarketingApp() {
  return (
    <Routes>
      {marketingRoutes}
    </Routes>
  );
}
