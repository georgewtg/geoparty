import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SettingsModal from "../modals/SettingsModal";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Outlet />
      <SettingsModal />
    </>
  );
};

export default ProtectedRoute;