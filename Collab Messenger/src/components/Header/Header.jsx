import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Box, IconButton, Icon } from "@mui/material";
import { AppContext } from "../../store/app.context";
import { logoutUser } from "../../services/auth.service";

import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Header() {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const { setAppState } = useContext(AppContext);


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
                <IconButton
                onClick={logout}
                color="inherit"
                sx={{ 
                  bgcolor: "grey.900", 
                  color: "primary.main", 
                  borderRadius: 2, 
                  padding: 1,
                  "&:hover": { bgcolor: "primary.light" },
                  mr: 2 // Space between buttons
                }}>
                
              <LogoutIcon sx={{ fontSize: 30 }} />
             </IconButton>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
