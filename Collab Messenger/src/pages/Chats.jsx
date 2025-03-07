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
    const postsRef = ref(db, 'teams');
    onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      if (postsData) {
        const teamsList = Object.entries(postsData)
          .map(([id, team]) => ({
            id,
            teamName: team.teamName || 'Unnamed Team',
            owner: team.owner || 'Unknown Owner',
            channels: team.channels ? Object.keys(team.channels) : [],
            members: team.members ? Object.values(team.members) : [],
          }))
          .filter(
            (team) =>
              team.members.includes(userData?.handle) ||
              team.owner === userData?.handle
          );

        setTeams(teamsList);
      } else {
        setTeams([]);
      }
      setLoading(false);
    });
  }, [userData?.handle]);

  return (
    <Container component="main" sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'gray.100', padding: 2 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom onClick={() => navigate('/')}>Teams & Chats</Typography>
      <Button variant="contained" color="primary" sx={{ maxWidth: 200, mb: 2 }} onClick={() => navigate('/new-chat')}>New Chat</Button>
      {loading ? (
        <Stack alignItems="center" justifyContent="center" spacing={2} mt={5}>
          <CircularProgress color="primary" />
          <Typography color="primary">Loading teams...</Typography>
        </Stack>
      ) : (
        <Box sx={{ height: "100%", width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {teams.map((team) => (
            <Card key={team.id} variant="outlined" sx={{ padding: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'teal' }}>{team.teamName[0]}</Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{team.teamName}</Typography>
                    <Typography variant="body2" color="textSecondary">Owner: {team.owner}</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Accordion sx={{ width: '100%', boxShadow: 'none' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" color="primary">View Channels</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack direction="column" spacing={1}>
                      {team.channels.length > 0 ? (
                        team.channels.map((channelName, index) => (
                          <Chip
                            key={index}
                            label={channelName}
                            size="small"
                            onClick={() => navigate(`/teams/${team.id}/channels/${channelName}`)}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">No channels</Typography>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
