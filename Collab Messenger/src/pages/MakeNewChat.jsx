import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../store/app.context';
import { db } from "../configs/firebaseConfig";
import { ref, set, push } from 'firebase/database';
import { getUserData } from '../services/user.service';
import { Box, Button, Typography, TextField, Stack, Alert } from '@mui/material';

const MakeNewChat = () => {
    const { user } = useContext(AppContext);

    const [teamName, setteamName] = useState('');
    const [channelName, setChannelName] = useState('');
    const [members, setMembers] = useState('');
    const [owner, setOwner] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        getUserData(user.uid).then((data) =>
            setOwner(data[Object.keys(data)[0]].handle)
        );
    }, [user]);

    const uploadTeam = async () => {
        try {
            const newTeamRef = push(ref(db, 'teams'));
            const teamId = newTeamRef.key;
    
            const team = {
                teamName,
                channels: channelName.split(',').map(channel => channel.trim()),
                members: members.split(',').map(member => member.trim()),
                owner,
                createdOn: new Date().toString(),
                uid: teamId,
            };
    
            await set(ref(db, `teams/${teamId}`), team);
    
            const channels = channelName.split(',').map(channel => channel.trim());
            for (const channel of channels) {
                const channelData = {
                    teamId,
                    title: channel,
                    type: "public",
                    participants: team.members,
                    messages: { 0: { content: 'Welcome to the team!', sender: 'Admin', timestamp: new Date().toString() } },
                };
                await set(ref(db, `channels/${teamId}/${channel}`), channelData);
            }
    
            setteamName('');
            setChannelName('');
            setMembers('');
            alert('Team created successfully');
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
                        <Typography mb={2} color="white">Team Name</Typography>
                        <TextField
                            id="teamName"
                            value={teamName}
                            onChange={(e) => setteamName(e.target.value)}
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
                        <Typography mb={2} color="white">Channel Name</Typography>
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
                        <Typography mb={2} color="white">Members (comma separated)</Typography>
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
