import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "./AuthContext";

export function ProtectedRoute() {
  //   const { isAuthenticated } = useAuth();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return isLoggedIn ? <Outlet /> : <Navigate to="/auth" replace />;
}
