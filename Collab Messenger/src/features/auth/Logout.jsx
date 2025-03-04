import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
import { useContext } from "react";
import { AppContext } from "../../store/app.context";
import { Button } from "@mui/material";

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
        navigate('/');
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  return (
    <Button
      onClick={logout}
      variant="contained"
      color="blue.600"
      sx={{ borderRadius: 2, px: 3, fontWeight: "bold", textTransform: "none" }}
    >
      Logout
    </Button>
  );
};

export default Logout;