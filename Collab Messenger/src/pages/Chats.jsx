import { db } from "../configs/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Container
} from "@mui/material";
import Grid2 from "@mui/material/Grid2"; // Correct import for Grid2

export default function Chats() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const postsRef = ref(db, "teams");
    onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      if (postsData) {
        const teamsList = Object.entries(postsData).map(([id, team]) => ({
          id,
          teamName: team.teamName || "Unnamed Team",
          owner: team.owner || "Unknown Owner",
          channels: team.channels ? Object.keys(team.channels) : [],
          members: team.members ? Object.keys(team.members) : [],
        }));
        setTeams(teamsList);
      } else {
        setTeams([]); // Handle case with no data
      }
      setLoading(false);
    });
  }, []);

  return (
    <Container component="main"
    maxWidth="xs"
    sx={{
      width: "100%",
      marginLeft: "0",
      marginRight: "0",
      paddingLeft: "0",
      paddingRight: "0",
    }}>
    <Box
      p={1}
      m={0}
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      width="100%"
      overflow="auto" // Handle overflow by adding scrollbar
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="left"
        gutterBottom
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
                onClick={() => navigate(`/team/${team.id}`)} // Navigate to the team details page
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

                  <Typography variant="subtitle1" color="primary">
                    Channels:
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={1} mt={1}>
                    {team.channels.length > 0 ? (
                      team.channels.map((channelId, index) => (
                        <Chip
                          key={index}
                          label={
                            channelId.length > 15
                              ? `${channelId.substring(0, 15)}...`
                              : channelId
                          }
                          color="default"
                          size="small"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No channels
                      </Typography>
                    )}
                  </Stack>
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
