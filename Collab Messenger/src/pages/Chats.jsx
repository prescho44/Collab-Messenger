import { db } from '../configs/firebaseConfig';
import { ref, onValue, set } from 'firebase/database';
import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom'; // Import useLocation and useParams
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function Chats() {
  const { userData } = useContext(AppContext);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]); // State for team members
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Get current URL
  const { teamId } = useParams(); // Extract teamId using useParams
  const [alignment, setAlignment] = useState('tabTeamsAndChat');

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
                  members: members, // Add members to the team object
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

  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);

    // Update members when "Members" is selected
    if (newAlignment === 'tabMembers') {
      const currentTeam = teams.find((team) => team.id === teamId);
      setMembers(currentTeam?.members || []);
    }
  };

  const handleKickMember = (memberToKick) => {
    const teamRef = ref(db, `teams/${teamId}/members`);
    onValue(teamRef, (snapshot) => {
      const members = snapshot.val() || [];
      const updatedMembers = members.filter(
        (member) => member !== memberToKick
      ); // Remove the kicked member
      set(teamRef, updatedMembers); // Update the database with the new members list

      // Update the local state to reflect the change immediately
      setMembers((prevMembers) =>
        prevMembers.filter((member) => member !== memberToKick)
      );
    });

    // Remove the kicked member's access to the chat
    const channelsRef = ref(db, `channels/${teamId}`);
    onValue(channelsRef, (snapshot) => {
      const channels = snapshot.val() || {};
      Object.keys(channels).forEach((channelId) => {
        const participantsRef = ref(
          db,
          `channels/${teamId}/${channelId}/participants`
        );
        onValue(participantsRef, (participantsSnapshot) => {
          const participants = participantsSnapshot.val() || [];
          const updatedParticipants = participants.filter(
            (participant) => participant !== memberToKick
          );
          set(participantsRef, updatedParticipants);
        });
      });
    });
  };

  // Determine if the current URL matches the required pattern
  const isTeamChannelURL = /^\/teams\/[^/]+\/channels\/[^/]+$/.test(
    location.pathname
  );

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
      {/* Show ToggleButtonGroup only if the URL matches */}
      {isTeamChannelURL && (
        <Stack spacing={2} sx={{ alignItems: 'center', width: '100%' }}>
          <ToggleButtonGroup
            maxWidth
            color="primary"
            value={alignment}
            exclusive
            onChange={handleChange}
            aria-label="Platform"
          >
            <ToggleButton value="tabTeamsAndChat">Teams & Chats</ToggleButton>
            <ToggleButton value="tabMembers">Members</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      )}

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
      ) : alignment === 'tabTeamsAndChat' ? (
        // Teams & Chats view
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
      ) : (
        // Members view
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: 1,
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
            {members.length > 0 ? (
              members.map((member, index) => (
                <Card key={index} variant="outlined" sx={{ padding: 2 }}>
                  <CardContent>
                    <Stack direction="column" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'teal', width: 56, height: 56 }}>
                        {member[0]}
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {member}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Member of the team
                      </Typography>
                      {teams.find((team) => team.id === teamId)?.owner ===
                        userData?.handle && (
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleKickMember(member)}
                        >
                          Kick
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No members found.
              </Typography>
            )}
          </Stack>
        </Box>
      )}
    </Container>
  );
}
