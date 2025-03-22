import {
  Box,
  Container,
  Stack,
  
  IconButton,
  Divider,
  Link,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useContext } from "react";
import { AppContext } from "../store/app.context";
import TeamsAndUsers from "../TeamsAndUsers/TeamsAndUsers";

export default function Footer() {
  const { user } = useContext(AppContext);

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
            <Link href="/" color="inherit" underline="hover">
              Home
            </Link>

            {user ? (
              <>
                <Link href="/new-team" color="inherit" underline="hover">
                  New Chat
                </Link>
                <Link href="/profile" color="inherit" underline="hover">
                  Your Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" color="inherit" underline="hover">
                  Login
                </Link>
                <Link href="/register" color="inherit" underline="hover">
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
