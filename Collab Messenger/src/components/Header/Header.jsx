import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import { AppContext } from "../../store/app.context";
import Logout from "../../features/auth/Logout";

export default function Header() {
  const { user } = useContext(AppContext);

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
              <Button component={NavLink} to="/login" variant="outlined" color="inherit" sx={{ mx: 1 }}>
                Login
              </Button>
              <Button component={NavLink} to="/register" variant="outlined" color="inherit">
                Register
              </Button>
            </>
          ) : (
            <Logout />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}