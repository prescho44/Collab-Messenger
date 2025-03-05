import { db } from "../configs/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../store/app.context"; // Assuming you have this context to manage the user data
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Divider,
  Stack,
  Chip,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid2 from "@mui/material/Grid2"; // Correct import for Grid2

export default function Chats() {
  const { userData } = useContext(AppContext); // Access the current user data from context
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const postsRef = ref(db, "teams");
    onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      if (postsData) {
        const teamsList = Object.entries(postsData)
          .map(([id, team]) => ({
            id,
            teamName: team.teamName || "Unnamed Team",
            owner: team.owner || "Unknown Owner",
            channels: team.channels ? Object.keys(team.channels) : [],
            members: team.members ? Object.keys(team.members) : [],
          }))
          // Filter teams where the current user is a member or owner
          .filter((team) => team.members.includes(userData?.handle) || team.owner === userData?.handle);

        setTeams(teamsList);
      } else {
        setTeams([]); // Handle case with no data
      }
      setLoading(false);
    });
  }, [userData?.handle]); // Depend on userData.handle to re-fetch when it changes

  return (
    <Container
      component="main"
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "gray.100",
        padding: 0,
        margin: 0,
      }}
    >
      <Box
        p={1}
        m={0}
        display="flex"
        flexDirection="column"
        width="100%"
        overflow="auto"
        sx={{
          gap: 1,
          minWidth: 300,
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          backgroundColor: "gray.100",
        }} // Handle overflow by adding scrollbar
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="left"
          gutterBottom
          onClick={() => navigate("/")}
        >
          Teams & Chats
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{ width: "100%", maxWidth: 200, padding: "8px 16px", mt: 2, mb: 2 }} // Set a maxWidth for button
          onClick={() => navigate("/new-chat")}
        >
          Make a New Chat
        </Button>

        {loading ? (
          <Stack alignItems="center" justifyContent="center" spacing={2} mt={5}>
            <CircularProgress color="primary" />
            <Typography color="primary">Loading teams...</Typography>
          </Stack>
        ) : teams.length === 0 ? (
          <Typography color="textSecondary" textAlign="center">
            No teams available
          </Typography>
        ) : (
          <Grid2 container spacing={3} justifyContent="flex-start" wrap="wrap">
            {teams.map((team) => (
              <Grid2 item xs={12} sm={6} md={4} lg={3} key={team.id}>
                <Card
                  variant="outlined"
                  sx={{ cursor: "pointer" }} // Add pointer cursor to indicate clickable
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                      <Avatar sx={{ bgcolor: "teal" }}>{team.teamName[0]}</Avatar>
                      <Box>
                        <Typography variant="h6" color="teal">
                          {team.teamName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Owner: {team.owner}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography variant="subtitle1" color="primary">
                          Channels
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack direction="row" flexWrap="wrap" spacing={1} mt={1}>
                          {team.channels.length > 0 ? (
                            team.channels.map((channelName, index) => (
                              <Chip
                                key={index}
                                label={channelName.length > 15 ? `${channelName.substring(0, 15)}...` : channelName}
                                color="default"
                                size="small"
                                onClick={() => navigate(`/teams/${team.id}/channels/${channelName}`)}
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No channels
                            </Typography>
                          )}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        )}
      </Box>
    </Container>
  );
}
