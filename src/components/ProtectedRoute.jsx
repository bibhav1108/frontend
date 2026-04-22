import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const getUserRole = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch {
    return null;
  }
};

const getOrgStatus = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.org_status;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children, allowedRoles, requireVerifiedOrg = false }) => {
  const token = localStorage.getItem("token");

  // 🔒 Not logged in
  if (!token || !isTokenValid(token)) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole(token);
  const orgStatus = getOrgStatus(token);

  // 🎭 Role check
  if (allowedRoles && !allowedRoles.includes(role)) {
    // redirect smartly
    if (role === "SYSTEM_ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (role === "VOLUNTEER") return <Navigate to="/volunteer/dashboard" replace />;
    if (role === "NGO_ADMIN") return <Navigate to="/ngo-admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  // 🛡️ Onboarding Guard (Redirect if org is not yet verified or doesn't exist)
  if (requireVerifiedOrg && role === "NGO_ADMIN") {
    if (!orgStatus || orgStatus === "DRAFT" || orgStatus === "VERIFICATION_REQUESTED") {
      return <Navigate to="/ngo-admin/identity" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
