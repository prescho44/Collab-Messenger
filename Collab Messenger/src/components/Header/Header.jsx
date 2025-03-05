import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Box, IconButton } from "@mui/material";
import { AppContext } from "../../store/app.context";
import Logout from "../../features/auth/Logout";
import AccountBoxIcon from '@mui/icons-material/AccountBox';

export default function Header() {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* Profile Button with Icon */}
              <IconButton 
                onClick={() => navigate('/profile')}
                color="inherit"
                sx={{ 
                  bgcolor: "grey.900", 
                  color: "primary.main", 
                  borderRadius: 2, 
                  padding: 1,
                  "&:hover": { bgcolor: "primary.light" },
                  mr: 2 // Space between buttons
                }}
              >
                <AccountBoxIcon sx={{ fontSize: 30 }} />
              </IconButton>

              {/* Logout Button */}
              <Logout />
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
