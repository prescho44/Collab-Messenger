import { db } from '../configs/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../store/app.context';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function Chats() {
  const { userData } = useContext(AppContext);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      const teamsRef = ref(db, 'teams');
      onValue(teamsRef, async (snapshot) => {
        const teamsData = snapshot.val();
        if (teamsData) {
          const teamPromises = Object.entries(teamsData).map(
            async ([teamId, team]) => {
              const members = team.members || [];
              const owner = team.owner || '';

              // Filter channels the user belongs to
              const channelPromises = Object.entries(team.channels || {}).map(
                async ([channelId, channelName]) => {
                  const channelParticipantsRef = ref(
                    db,
                    `channels/${teamId}/${channelId}/participants`
                  );
                  const participantsSnapshot = await new Promise((resolve) =>
                    onValue(
                      channelParticipantsRef,
                      (snap) => resolve(snap.val()),
                      { onlyOnce: true }
                    )
                  );
                  const participants = participantsSnapshot || [];
                  if (participants.includes(userData?.handle)) {
                    return { id: channelId, name: channelName };
                  }
                  return null;
                }
              );

              const filteredChannels = (
                await Promise.all(channelPromises)
              ).filter((channel) => channel !== null);

              // Return the team only if the user is a member or owner
              if (
                members.includes(userData?.handle) ||
                owner === userData?.handle
              ) {
                return {
                  id: teamId,
                  name: team.teamName,
                  owner: owner,
                  channels: filteredChannels,
                };
              }
              return null;
            }
          );

          const filteredTeams = (await Promise.all(teamPromises)).filter(
            (team) => team !== null
          );
          setTeams(filteredTeams);
        } else {
          setTeams([]);
        }
        setLoading(false);
      });
    };

    fetchTeams();
  }, [userData?.handle]);

  return (
    <Container
      component="main"
      sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'gray.100',
        padding: 2,
        height: 'calc(100vh - 64px)', // Subtract header height
        overflow: 'auto',
        marginBottom: 3,
      }}
    >
      {/* Header section */}
      <Box sx={{ flexShrink: 0 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          onClick={() => navigate('/')}
        >
          Teams & Chats
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ maxWidth: 200, mb: 2 }}
          onClick={() => navigate('/new-team')}
        >
          New Chat
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{ maxWidth: 200, mb: 2, ml: 2 }}
          onClick={() => navigate('/new-channel')}
        >
          New Channel
        </Button>
      </Box>

      {loading ? (
        <Stack alignItems="center" justifyContent="center" spacing={2} mt={5}>
          <CircularProgress color="primary" />
          <Typography color="primary">Loading teams...</Typography>
        </Stack>
      ) : (
        // Scrollable teams section
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto', // Enable vertical scrolling
            paddingRight: 1, // Add some padding for the scrollbar
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'background.paper',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.main',
              borderRadius: '4px',
            },
          }}
        >
          <Stack spacing={2}>
            {teams.map((team) => (
              <Card key={team.id} variant="outlined" sx={{ padding: 2 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'teal' }}>{team.name[0]}</Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {team.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Owner: {team.owner}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Accordion sx={{ width: '100%', boxShadow: 'none' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2" color="primary">
                        View Channels
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack direction="column" spacing={1}>
                        {team.channels.length > 0 ? (
                          team.channels.map((channel) => (
                            <Chip
                              key={channel.id}
                              label={channel.name}
                              size="small"
                              onClick={() =>
                                navigate(
                                  `/teams/${team.id}/channels/${channel.id}`
                                )
                              }
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
            ))}
          </Stack>
        </Box>
      )}
    </Container>
  );
}
