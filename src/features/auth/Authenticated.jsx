import { useContext } from "react"
import { Navigate, useLocation } from "react-router-dom"
import PropTypes from 'prop-types';
import { AppContext } from "../../store/app.context";

export default function Authenticated({ children }) {

  const { user, isInitialized } = useContext(AppContext);
  const location = useLocation();

  if (!isInitialized) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div>
      {children}
    </div>
  )
}

Authenticated.propTypes = {
  children: PropTypes.node.isRequired
}