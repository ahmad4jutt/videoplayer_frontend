import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";

const ProtectedRoute = ({ children }) => {
  const { currentUser, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
