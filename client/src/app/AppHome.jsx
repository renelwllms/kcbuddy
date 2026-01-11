import { Navigate } from "react-router-dom";
import { readSession } from "../lib/session.js";

export default function AppHome() {
  const session = readSession();
  if (!session) {
    return <Navigate to="/app/login" replace />;
  }

  const target = session.role === "kid" ? "/app/kid" : "/app/parent";
  return <Navigate to={target} replace />;
}
