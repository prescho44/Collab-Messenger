import { db } from '../configs/firebaseConfig';
import { ref, onValue, set } from 'firebase/database';
import { useState, useContext } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useFetchTeams from '../hooks/useFetchTeams';
import useFetchUsers from '../hooks/useFetchUsers';
import AddMemberDialog from '../components/AddMemberDialog';
import { createDirectChat } from '../components/DirectChat/CreateDirectChat';
import { useEffect } from 'react';

export default function Chats() {
  const { userData } = useContext(AppContext);
  const { teams, loading } = useFetchTeams();
  const allUsers = useFetchUsers();
  const [members, setMembers] = useState([]);
  const [openAddMemberDialog, setOpenAddMemberDialog] = useState(false);
  const [newMember, setNewMember] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId } = useParams();
  const [alignment, setAlignment] = useState('tabTeamsAndChat');
  const [directChats, setDirectChats] = useState([]);

  useEffect(() => {
    const fetchDirectChats = async () => {
      try {
        const directChatsRef = ref(db, 'directChats');
        onValue(directChatsRef, (snapshot) => {
          const data = snapshot.val();
          const chats = data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [];
          setDirectChats(chats);
        });
      } catch (error) {
        console.error('Error fetching direct chats:', error);
      }
    };

    fetchDirectChats();
  }, []);


  const handleChange = (event, newAlignment) => {
    setAlignment(newAlignment);

    if (newAlignment === 'tabMembers') {
      const currentTeam = teams.find((team) => team.id === teamId);
      setMembers(currentTeam?.members || []);
    }
  };

  const handleKickMember = async (memberToKick) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/members`);
      const snapshot = await new Promise((resolve) =>
        onValue(teamRef, (snap) => resolve(snap.val()), { onlyOnce: true })
      );
      const members = snapshot || [];
      const updatedMembers = members.filter((member) => member !== memberToKick);
      await set(teamRef, updatedMembers);

      setMembers((prevMembers) =>
        prevMembers.filter((member) => member !== memberToKick)
      );

      const channelsRef = ref(db, `channels/${teamId}`);
      const channelsSnapshot = await new Promise((resolve) =>
        onValue(channelsRef, (snap) => resolve(snap.val()), { onlyOnce: true })
      );
      const channels = channelsSnapshot || {};
      for (const channelId in channels) {
        const participantsRef = ref(db, `channels/${teamId}/${channelId}/participants`);
        const participantsSnapshot = await new Promise((resolve) =>
          onValue(participantsRef, (snap) => resolve(snap.val()), { onlyOnce: true })
        );
        const participants = participantsSnapshot || [];
        const updatedParticipants = participants.filter((participant) => participant !== memberToKick);
        await set(participantsRef, updatedParticipants);
      }
    } catch (error) {
      console.error('Error kicking member:', error);
    }
  };

  const handleAddMember = async () => {
    try {
      const teamRef = ref(db, `teams/${teamId}/members`);
      const snapshot = await new Promise((resolve) =>
        onValue(teamRef, (snap) => resolve(snap.val()), { onlyOnce: true })
      );
      const members = snapshot || [];
      if (!members.includes(newMember)) {
        const updatedMembers = [...members, newMember];
        await set(teamRef, updatedMembers);

        setMembers(updatedMembers);

        const channelsRef = ref(db, `channels/${teamId}`);
        const channelsSnapshot = await new Promise((resolve) =>
          onValue(channelsRef, (snap) => resolve(snap.val()), { onlyOnce: true })
        );
        const channels = channelsSnapshot || {};
        for (const channelId in channels) {
          const participantsRef = ref(db, `channels/${teamId}/${channelId}/participants`);
          const participantsSnapshot = await new Promise((resolve) =>
            onValue(participantsRef, (snap) => resolve(snap.val()), { onlyOnce: true })
          );
          const participants = participantsSnapshot || [];
          if (!participants.includes(newMember)) {
            const updatedParticipants = [...participants, newMember];
            await set(participantsRef, updatedParticipants);
          }
        }
      }
    } catch (error) {
      console.error('Error adding member:', error);
    }
    setOpenAddMemberDialog(false);
    setNewMember('');
  };

  const handleDialogClose = () => {
    setOpenAddMemberDialog(false);
    setNewMember('');
  };

  const handleDirectChat = async () => {
    try {
      if (!selectedUser || !userData) {
        console.error('Selected user or user data is missing');
        return;
      }
    
      const selectedUserData = { handle: selectedUser }; // Create a user object with the handle
      const chatId = await createDirectChat(userData, selectedUserData);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating direct chat:', error);
    }
  };

  const isTeamChannelURL = /^\/teams\/[^/]+\/channels\/[^/]+$/.test(location.pathname);

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
        height: 'calc(100vh - 64px)',
        overflow: 'auto',
        marginBottom: 3,
      }}
    >
      {isTeamChannelURL && (
        <Stack spacing={2} sx={{ alignItems: 'center', width: '100%' }}>
          <ToggleButtonGroup
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
          New Team
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
                                navigate(`/teams/${team.id}/channels/${channel.id}`)
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
            <Divider />
            <Typography variant="h6" gutterBottom>
              Direct Chats
            </Typography>
            {directChats.map((chat) => (
              <Card key={chat.id} variant="outlined" sx={{ padding: 2 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'teal' }}>{chat.chatName[0]}</Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {chat.chatName}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/chat/${chat.id}`)}
                  >
                    Open Chat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      ) : (
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
          {teams.find((team) => team.id === teamId)?.owner === userData?.handle && (
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => setOpenAddMemberDialog(true)}
            >
              Add Member
            </Button>
          )}
        </Box>
      )}

      <AddMemberDialog
        open={openAddMemberDialog}
        onClose={handleDialogClose}
        newMember={newMember}
        setNewMember={setNewMember}
        allUsers={allUsers}
        members={members}
        handleAddMember={handleAddMember}
      />

      <Box sx={{ mt: 4 }}>
        <FormControl fullWidth>
          <InputLabel>Select User for Direct Chat</InputLabel>
          <Select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            required
            sx={{
              backgroundColor: 'gray.600',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'teal',
                },
                '&:hover fieldset': {
                  borderColor: 'teal',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'teal',
                },
              },
            }}
          >
            {allUsers
              .filter((user) => user !== userData.handle)
              .map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3, px: 4 , }}
          onClick={handleDirectChat}
        >
          Start Direct Chat
        </Button>
      </Box>
    </Container>
  );
}