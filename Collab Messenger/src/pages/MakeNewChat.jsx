import React, { useState, useContext } from 'react';
import { AppContext } from '../store/app.context';
import { db } from '../configs/firebaseConfig';
import { ref, set, push } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Stack,
  Alert,
} from '@mui/material';

const MakeNewChat = () => {
  const { user, userData } = useContext(AppContext);

  const [teamName, setTeamName] = useState('');
  const [channelName, setChannelName] = useState('');
  const [members, setMembers] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Use navigate hook

  const uploadTeam = async () => {
    try {
      const newTeamRef = push(ref(db, 'teams'));
      const teamId = newTeamRef.key;

      const channelsArray = channelName.split(',').map(channel => channel.trim());
      const channelsObject = channelsArray.reduce((acc, channel) => {
        acc[channel] = true; // Use the channel name as the key
        return acc;
      }, {});

      const team = {
        teamName,
        channels: channelsObject,
        members: members.split(',').map(member => member.trim()),
        owner: userData?.handle,
        createdOn: new Date().toString(),
        uid: teamId,
      };

      await set(ref(db, `teams/${teamId}`), team);

      for (const channel of channelsArray) {
        const channelData = {
          teamId,
          title: channel,
          type: 'public',
          participants: team.members,
          messages: {
            0: {
              content: 'Welcome to the team!',
              sender: 'Admin',
              timestamp: new Date().toString(),
            },
          },
        };
        await set(ref(db, `channels/${teamId}/${channel}`), channelData);
      }

      setTeamName('');
      setChannelName('');
      setMembers('');
      alert('Team created successfully');

      // Navigate to the home or teams page (or any route you prefer)
      navigate('/'); // This will redirect to the home page after creating the team
    } catch (error) {
      console.error('Error creating team:', error.message);
      setError('Error creating team');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName || !channelName || !members) {
      setError('Please enter all team details');
      return;
    }

    console.log('Team created:', { teamName, channelName, members });
    uploadTeam();
  };

  if (!user) {
    return (
      <Box p={5} bgcolor="error.main" borderRadius="md" boxShadow={3}>
        <Typography color="error.contrastText" variant="h6">
          You must be logged in to create a team
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      p={5}
      maxWidth="600px"
      mx="auto"
      bgcolor="grey.900"
      borderRadius="md"
      boxShadow={3}
    >
      <Typography variant="h5" color="white" gutterBottom>
        Create a Team
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <Box>
            <Typography mb={2} color="white">
              Team Name
            </Typography>
            <TextField
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              maxLength={64}
              placeholder="Enter the team name"
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
            <Typography variant="caption" color="white" textAlign="right">
              {teamName.length}/64
            </Typography>
          </Box>

          <Box>
            <Typography mb={2} color="white">
              Channel Name
            </Typography>
            <TextField
              id="channelName"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
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
            <Typography variant="caption" color="white" textAlign="right">
              {channelName.length}/64
            </Typography>
          </Box>

          <Box>
            <Typography mb={2} color="white">
              Members (comma separated)
            </Typography>
            <TextField
              id="members"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="Enter members"
              fullWidth
              required
              variant="outlined"
              color="primary"
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
          </Box>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{
              padding: '12px',
              '&:hover': {
                backgroundColor: 'teal',
              },
            }}
          >
            Create Team
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default MakeNewChat;
