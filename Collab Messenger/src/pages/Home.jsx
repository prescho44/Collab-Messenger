import React, { useContext } from "react";
import { AppContext } from "../store/app.context";
import { Button, Typography, Box, Container } from "@mui/material";
import Chats from "./Chats";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
        }}
      >
        {user ? (
          // If user is logged in, show Chats component
          <Chats />
        ) : (
          <div style={{ width: "100%" }}>
            <Typography variant="h5" align="center" gutterBottom>
              Welcome to Collab Messenger
            </Typography>
            <Typography variant="body1" align="center" component={"p"} gutterBottom>
              Please log in or register to continue.
            </Typography>

            {/* Description Text */}
            <Typography variant="body2" align="center" component="p" sx={{ mb: 3 }}>
              This is a Discord clone designed for seamless communication and collaboration.
            </Typography>

            {/* Buttons for navigation */}
            <Button
              variant="contained"
              color="primary"
              sx={{ mb: 2, width: "100%", maxWidth: 250, padding: "8px 16px" }}
              onClick={() => handleNavigate("/login")}
            >
              Log In
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ width: "100%", maxWidth: 250, padding: "8px 16px" }}
              onClick={() => handleNavigate("/register")}
            >
              Register
            </Button>
          </div>
        )}
      </Box>
    </Container>
  );
};

export default Home;
