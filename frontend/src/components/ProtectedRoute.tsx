import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode; // more flexible than JSX.Element
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("accessToken");
  return isLoggedIn ? <>{children}</> : <Navigate to="/" />;
};

export default ProtectedRoute;
