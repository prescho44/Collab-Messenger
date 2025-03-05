import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth.service";
import { useContext } from "react";
import { AppContext } from "../../store/app.context";
import { Button, Box } from "@mui/material";

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
    <Box >
      
    <Button
      onClick={logout}
      variant="contained"
      color="secondary"
      sx={{ borderRadius: 2, px: 3, fontWeight: "bold", textTransform: "none" }}
    >
      Logout
  </Button>
  </Box>
  );
};

export default Logout;