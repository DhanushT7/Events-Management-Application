import React from "react";
import { useSnackbar } from "notistack";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem("userInfo")); // { name, email, role, dept }
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  if (!user) {
    enqueueSnackbar("Please login to continue.", { variant: "warning" });
    return <Navigate to={`/login/${allowedRole}`} state={{ from: location }} replace />;
  }

  if (user.role !== allowedRole) {
    enqueueSnackbar("Access denied: You are not authorized for this route.", { variant: "error" });
    return <Navigate to={`/login/${user.role}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
