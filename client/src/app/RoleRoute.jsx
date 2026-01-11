import { Navigate } from "react-router-dom";
import { readSession } from "../lib/session.js";

export default function RoleRoute({ allowed, children }) {
  const session = readSession();
  if (!session) {
    return <Navigate to="/app/login" replace />;
  }

  if (!allowed.includes(session.role)) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
