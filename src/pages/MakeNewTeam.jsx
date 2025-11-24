import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../store/app.context";
import { db } from "../configs/firebaseConfig";
import { ref, set, push, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  TextField,
  Stack,
  Alert,
  Chip,
  Autocomplete,
} from "@mui/material";

const MakeNewTeam = () => {
  const { user, userData } = useContext(AppContext);

  const [teamName, setTeamName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [members, setMembers] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [memberError, setMemberError] = useState("");
  const [existingTeamNames, setExistingTeamNames] = useState([]);

  const navigate = useNavigate(); // Use navigate hook

  useEffect(() => {
    // Fetch users from Firebase
    const fetchUsers = async () => {
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersList = Object.values(usersData).map((user) => user.handle);
        setUsers(usersList);
      }
    };

    // Fetch existing team names from Firebase
    const fetchTeamNames = async () => {
      const teamsRef = ref(db, "teams");
      const snapshot = await get(teamsRef);
      if (snapshot.exists()) {
        const teamsData = snapshot.val();
        const teamNamesList = Object.values(teamsData).map(
          (team) => team.teamName
        );
        setExistingTeamNames(teamNamesList);
      }
    };

    fetchUsers();
    fetchTeamNames();
  }, []);

  const uploadTeam = async () => {
    try {
      const newTeamRef = push(ref(db, "teams"));
      const teamId = newTeamRef.key;

      const channelsArray = channelName
        .split(",")
        .map((channel) => channel.trim());
      const channelsObject = channelsArray.reduce((acc, channel) => {
        acc[channel] = channel; // Use a unique identifier for each channel
        return acc;
      }, {});

      const team = {
        teamName,
        channels: channelsObject,
        members: members.split(",").map((member) => member.trim()),
        owner: userData?.handle,
        createdOn: new Date().toString(),
        uid: teamId,
      };

      await set(ref(db, `teams/${teamId}`), team);

      for (const [channelId, channel] of Object.entries(channelsObject)) {
        const channelData = {
          teamId,
          title: channel,
          type: "public",
          participants: team.members,
          messages: {
            0: {
              content: "Welcome to the team!",
              sender: "Admin",
              timestamp: new Date().toString(),
            },
          },
        };
        await set(ref(db, `channels/${teamId}/${channelId}`), channelData);
      }

      setTeamName("");
      setChannelName("");
      setMembers("");
      alert("Team created successfully");

      // Navigate to the home or teams page (or any route you prefer)
      navigate("/"); // This will redirect to the home page after creating the team
    } catch (error) {
      console.error("Error creating team:", error.message);
      setError("Error creating team");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName || !channelName || !members) {
      setError("Please enter all team details");
      return;
    }

    if (teamName.length < 3 || teamName.length > 40) {
      return alert("Team name must be between 3 and 40 characters");
    }

    if (existingTeamNames.includes(teamName)) {
      return alert("Team name must be unique");
    }

    const memberList = members.split(",").map((member) => member.trim());
    const invalidMembers = memberList.filter(
      (member) => !users.includes(member)
    );
    if (invalidMembers.length > 0) {
      setMemberError(`Invalid members: ${invalidMembers.join(", ")}`);
      return;
    }

    setMemberError("");
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
      maxWidth={{ xs: "100%", sm: "600px" }}
      mx="auto"
      bgcolor="inherit"
      borderRadius="md"
      boxShadow={3}
    >
      <Typography variant="h5" color="inherit" gutterBottom>
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
            <Typography mb={2} color="inherit">
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
                backgroundColor: "gray.600",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "teal",
                  },
                  "&:hover fieldset": {
                    borderColor: "teal",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "teal",
                  },
                },
              }}
            />
            <Typography variant="caption" color="inherit" textAlign="right">
              {teamName.length}/64
            </Typography>
          </Box>

          <Box>
            <Typography mb={2} color="inherit">
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
                backgroundColor: "gray.600",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "teal",
                  },
                  "&:hover fieldset": {
                    borderColor: "teal",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "teal",
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
              Members
            </Typography>
            <Autocomplete
              multiple
              freeSolo
              options={users}
              getOptionLabel={(option) => option || ""}
              value={
                members ? members.split(",").map((member) => member.trim()) : []
              }
              onChange={(event, newValue) => setMembers(newValue.join(", "))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...chipProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      variant="outlined"
                      label={option}
                      {...chipProps}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Enter members"
                  fullWidth
                  sx={{
                    backgroundColor: "gray.600",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "teal",
                      },
                      "&:hover fieldset": {
                        borderColor: "teal",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "teal",
                      },
                    },
                  }}
                />
              )}
            />
            {memberError && (
              <Typography variant="body2" color="error" mt={1}>
                {memberError}
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{
              padding: "12px",
              "&:hover": {
                backgroundColor: "teal",
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

export default MakeNewTeam;
