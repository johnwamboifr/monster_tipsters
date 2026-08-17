import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const RoleRoute = ({ children, allowedRoles = ["admin"], redirectTo = "/home" }) => {
  const { userType } = useSelector((state) => state.auth);

  if (!allowedRoles.includes(userType)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleRoute;
