import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
import { useContext } from "react";
import { AppContext } from "../../store/app.context";
import { Button } from "@chakra-ui/react";

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
    <Button variant="outline" onClick={logout}>
      Logout
    </Button>
  );
};

export default Logout;