import { useContext } from "react"
import { Navigate, useLocation } from "react-router-dom"
import PropTypes from 'prop-types';
import { AppContext } from "../../store/app.context";

export default function Authenticated({ children }) {

  const { user } = useContext(AppContext);
  const location = useLocation();

  if (!user) {
    return <Navigate replace to="/login" state={{ from: location }} />
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