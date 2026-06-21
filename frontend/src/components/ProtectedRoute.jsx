import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, allowedRoles, children }) {
    
    // ❌ chưa login → về login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // ❌ sai role → về đúng dashboard
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={`/${user.role}`} replace />;
    }

    return children;
}

export default ProtectedRoute;