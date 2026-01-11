import { Routes, Route } from "react-router-dom";
import ProtectedLayout from "./ProtectedLayout.jsx";
import marketingRoutes from "./MarketingRoutes.jsx";
import AppHome from "./AppHome.jsx";
import RoleRoute from "./RoleRoute.jsx";
import KidDashboard from "../pages/KidDashboard.jsx";
import ParentDashboard from "../pages/ParentDashboard.jsx";
import Chores from "../pages/Chores.jsx";
import Submissions from "../pages/Submissions.jsx";
import Goals from "../pages/Goals.jsx";
import Login from "../pages/Login.jsx";

export default function App() {
  return (
    <Routes>
      {marketingRoutes}
      <Route path="/app/login" element={<Login />} />
      <Route path="/app" element={<ProtectedLayout />}>
        <Route index element={<AppHome />} />
        <Route
          path="parent"
          element={
            <RoleRoute allowed={["parent"]}>
              <ParentDashboard />
            </RoleRoute>
          }
        />
        <Route path="kid" element={<KidDashboard />} />
        <Route
          path="chores"
          element={
            <RoleRoute allowed={["parent"]}>
              <Chores />
            </RoleRoute>
          }
        />
        <Route path="submissions" element={<Submissions />} />
        <Route
          path="goals"
          element={
            <RoleRoute allowed={["kid", "parent"]}>
              <Goals />
            </RoleRoute>
          }
        />
      </Route>
    </Routes>
  );
}
