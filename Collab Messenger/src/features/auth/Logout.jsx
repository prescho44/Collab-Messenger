import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
import { useContext } from "react";
import { AppContext } from "../../store/app.context";

const Logout = () => {
  const { setAppState } = useContext(AppContext);
  const navigate = useNavigate();

  const logout = () => {
    logoutUser()
      .then(() => {
        setAppState({
          user: null,
          userData: null,
        });
        navigate('/login');
      })
      .catch((error) => {
        console.error(error.message);
      });
  };
  return (
    <>
      <div onClick={logout} className="logoutButton"> 
        Logout
      </div>
    </>
  );
};
export default Logout;