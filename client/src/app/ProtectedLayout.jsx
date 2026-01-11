import { Navigate } from "react-router-dom";
import AppLayout from "./AppLayout.jsx";
import { readSession } from "../lib/session.js";

export default function ProtectedLayout() {
  const session = readSession();
  if (!session) {
    return <Navigate to="/app/login" replace />;
  }

  return <AppLayout session={session} />;
}
