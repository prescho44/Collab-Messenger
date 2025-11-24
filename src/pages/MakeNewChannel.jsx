import React, { useState, useContext, useEffect } from 'react';
import { ref, set, get, update } from 'firebase/database';
import { db } from '../configs/firebaseConfig';
import { AppContext } from '../store/app.context';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Stack,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const MakeNewChannel = () => {
  const { userData } = useContext(AppContext);
  const [channelName, setChannelName] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userTeams, setUserTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTeams = async () => {
      const teamsRef = ref(db, 'teams');
      const snapshot = await get(teamsRef);
      if (snapshot.exists()) {
        const teamsData = snapshot.val();
        const teamsList = [];

        Object.entries(teamsData).forEach(([teamId, team]) => {
          const members = team.members ? Object.keys(team.members) : [];
          if (members.includes(userData?.handle) || team.owner === userData?.handle) {
            teamsList.push({ teamId, teamName: team.teamName || 'Unnamed Team' });
          }
        });

        setUserTeams(teamsList);
        if (teamsList.length > 0) {
          setSelectedTeamId(teamsList[0].teamId); // Default select the first team
        }
      }
    };

    fetchUserTeams();
  }, [userData?.handle]);

  useEffect(() => {
    if (selectedTeamId) {
      const fetchTeamMembers = async () => {
        const teamRef = ref(db, `teams/${selectedTeamId}`);
        const snapshot = await get(teamRef);
        if (snapshot.exists()) {
          const teamData = snapshot.val();
          const membersList = teamData.members ? Object.values(teamData.members) : [];
          setTeamMembers(membersList);

        }
      };

      fetchTeamMembers();
      
    }
  }, [selectedTeamId]);

  const handleInputChange = (e) => {
    setChannelName(e.target.value);
  };
  const handleMembersChange = (e) => {
    const value = e.target.value;
    setMembers(typeof value === 'string' ? value.split(',') : value);
  };

  const handleTeamChange = (e) => {
    setSelectedTeamId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newChannelId = Date.now().toString(); // Using timestamp as a simple unique ID

    try {
      // Check if the team already has channels
      const channelsRef = ref(db, `teams/${selectedTeamId}/channels`);
      const snapshot = await get(channelsRef);

      let updatedChannels = {};
      if (snapshot.exists()) {
        // If channels exist, add the new channel
        updatedChannels = snapshot.val();
      }

      // Create a new channel with the unique ID
      updatedChannels[newChannelId] = channelName;

      // Update the channels list
      await update(channelsRef, updatedChannels);

      // Create the new channel under channels/{teamId}
      const teamChannelRef = ref(db, `channels/${selectedTeamId}/${newChannelId}`);
      await set(teamChannelRef, {
        title: channelName,
        participants: members,
        messages: {
          0: {
            content: 'Welcome to the channel!',
            sender: 'Admin',
            timestamp: new Date().toString(),
          },
        },
        teamId: selectedTeamId,
        type: 'public',
      });

      navigate(`/teams/${selectedTeamId}/channels/${newChannelId}`);
    } catch (error) {
      console.error('Error creating channel:', error);
      setError('Error creating channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      p={5}
      maxWidth={{ xs: '100%', sm: '600px' }}
      mx="auto"
      bgcolor="inherit"
      borderRadius="md"
      boxShadow={3}
    >
      <Typography variant="h5" color="inherit" gutterBottom>
        Create a New Channel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <Box>
            <FormControl fullWidth>
              <InputLabel>Select Team</InputLabel>
              <Select
                value={selectedTeamId}
                onChange={handleTeamChange}
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
                {userTeams.map((team) => (
                  <MenuItem key={team.teamId} value={team.teamId}>
                    {team.teamName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography mb={2} color="inherit">
              Channel Name
            </Typography>
            <TextField
              id="channelName"
              value={channelName}
              onChange={handleInputChange}
              maxLength={64}
              placeholder="Enter the channel name"
              fullWidth
              required
              variant="outlined"
              color="primary"
              inputProps={{ maxLength: 64 }}
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
            />
            <Typography variant="caption" color="inherit" textAlign="right">
              {channelName.length}/64
            </Typography>
          </Box>

          <Box>
            <Typography mb={2} color="inherit">
              Select Members
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Members</InputLabel>
              <Select
                multiple
                value={members}
                onChange={handleMembersChange}
                renderValue={(selected) => selected.join(', ')}
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
                {teamMembers.map((member) => (
                  <MenuItem key={member} value={member}>
                    {member}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              padding: '12px',
              '&:hover': {
                backgroundColor: 'teal',
              },
            }}
          >
            {loading ? 'Creating...' : 'Create Channel'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default MakeNewChannel;
