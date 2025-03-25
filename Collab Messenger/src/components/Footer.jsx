import {
  Box,
  Container,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useContext } from "react";
import { AppContext } from "../store/app.context";
import TeamsAndUsers from "../TeamsAndUsers/TeamsAndUsers";
import { Link } from "react-router-dom";

export default function Footer() {
  const { user, userData } = useContext(AppContext);

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "inherit",
        color: "grey.500",
        py: 0,
        position: "relative",
        bottom: 0,
        width: "100%",
        height: "0%",
        mt: 1,
      }}
    >
      <Divider sx={{ bgcolor: "grey.700", width: "100%", mb: "25px" }} />

      <Container maxwidth="lg">
        <Stack spacing={3} alignItems="center">
          {/* Navigation Links */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Link to="/" style={{color: '#9e9e9e', textDecoration: 'none'}}>
              Home
            </Link>

            {user ? (
              <>
                <Link to="/new-team" style={{color: '#9e9e9e', textDecoration: 'none'}}>
                  New Chat
                </Link>
                <Link to={`/profile/${userData?.uid}`} style={{color: '#9e9e9e', textDecoration: 'none'}}>
                  Your Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" style={{color: '#9e9e9e', textDecoration: 'none'}}>
                  Login
                </Link>
                <Link to="/register" style={{color: '#9e9e9e', textDecoration: 'none'}}>
                  Register
                </Link>
              </>
            )}
          </Stack>

          {/* Social Media Icons */}
          <IconButton
            component="a"
            href="https://github.com/prescho44/Collab-Messenger"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: "inherit", "&:hover": { color: "inherit" } }}
          >
            <GitHubIcon fontSize="large" />
          </IconButton>

          <TeamsAndUsers />
        </Stack>
      </Container>
    </Box>
  );
}
