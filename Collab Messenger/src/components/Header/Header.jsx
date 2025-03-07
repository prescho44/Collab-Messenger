// filepath: c:\Users\User\Desktop\CollabMessenger\Collab-Messenger\Collab Messenger\src\components\Header\Header.jsx
import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { AppContext } from "../../store/app.context";
import { ThemeContext } from "../../store/theme.context";
import { logoutUser } from "../../services/auth.service";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function Header() {
  const { user, setAppState } = useContext(AppContext);
  const { toggleTheme, themeMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const logout = () => {
    logoutUser()
      .then(() => {
        setAppState({
          user: null,
          userData: null,
        });
        navigate("/");
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  return (
    <AppBar position="sticky" color="primary" elevation={4}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={NavLink}
          to="/"
          sx={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }}
        >
          Discord Clone
        </Typography>

        <Box>
          {!user ? (
            <>
              <IconButton onClick={toggleTheme} color="inherit">
                {themeMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
              <Button
                component={NavLink}
                to="/login"
                variant="outlined"
                color="inherit"
                sx={{ mx: 1 }}
              >
                Login
              </Button>
              <Button
                component={NavLink}
                to="/register"
                variant="outlined"
                color="inherit"
              >
                Register
              </Button>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={toggleTheme} color="inherit"
                sx={{
                  bgcolor: "inherit",
                  borderRadius: 2,
                  padding: 1,
                  "&:hover": { bgcolor: "primary.light" },
                  mr: 2,
                }}>
                {themeMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
              <IconButton
                onClick={() => navigate("/profile")}
                color="inherit"
                sx={{
                  bgcolor: "inherit",
                  borderRadius: 2,
                  padding: 1,
                  "&:hover": { bgcolor: "primary.light" },
                  mr: 2,
                }}
              >
                <AccountBoxIcon sx={{ fontSize: 30 }} />
              </IconButton>
              <IconButton
                onClick={logout}
                color="inherit"
                sx={{
                  bgcolor: "inherit",
                  borderRadius: 2,
                  padding: 1,
                  "&:hover": { bgcolor: "red" },
                  mr: 2,
                }}
              >
                <LogoutIcon sx={{ fontSize: 30 }
              } />
              </IconButton>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
