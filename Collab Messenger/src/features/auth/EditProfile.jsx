import { useState, useContext, useEffect } from "react";
import { AppContext } from "../../store/app.context";
import { db } from "../../configs/firebaseConfig";
import { ref, update, get } from "firebase/database";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
} from "@mui/material";
import {
  checkEmailExists,
  checkHandleExists,
} from "../../services/user.service";
import { uploadAvatar } from "../../services/storage.service";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { userData, setAppState } = useContext(AppContext);
  const navigate = useNavigate();

  // State
  const [handle, setHandle] = useState(userData.handle || "");
  const [email, setEmail] = useState(userData.email || "");
  const [phoneNumber, setPhoneNumber] = useState(userData.phoneNumber || "");
  const [status, setStatus] = useState(userData.status || "Online");
  const [profilePicture, setProfilePicture] = useState(
    userData.photo || "/default-avatar.jpg"
  );
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (!avatarFile) {
      setProfilePicture(userData.photo || "/default-avatar.jpg");
    }
  }, [userData.photo, avatarFile]);

  const handleSave = async () => {
    setError("");

    const emailExists = await checkEmailExists(email);
    if (emailExists && email !== userData.email) {
      setError("Email already exists");
      return;
    }

    const handleExists = await checkHandleExists(handle);
    if (handleExists && handle !== userData.handle) {
      setError("Username already exists");
      return;
    }

    const updates = {};
    if (handle !== userData.handle) updates.handle = handle;
    if (email !== userData.email) updates.email = email;
    if (phoneNumber !== userData.phoneNumber) updates.phoneNumber = phoneNumber;
    if (status !== userData.status) updates.status = status;

    const userRef = ref(db, `users/${userData.handle}`);

    if (avatarFile) {
      const profilePictureUrl = await uploadAvatar(userData.uid, avatarFile);
      updates.photo = profilePictureUrl;
      setProfilePicture(profilePictureUrl);
    }

    if (Object.keys(updates).length > 0) {
      await update(userRef, updates);
    }

    // Update references in teams and channels
    await updateReferences(userData.handle, handle);

    // Update local state
    setAppState((prev) => ({
      ...prev,
      userData: {
        ...prev.userData,
        ...updates,
      },
    }));

    navigate(`/profile/${userData.uid}`);
  };

  const updateReferences = async (oldHandle, newHandle) => {
    // Update teams
    const teamsRef = ref(db, 'teams');
    const teamsSnapshot = await get(teamsRef);
    if (teamsSnapshot.exists()) {
      const teams = teamsSnapshot.val();
      for (const teamId in teams) {
        const team = teams[teamId];
        if (team.members && team.members.includes(oldHandle)) {
          const updatedMembers = team.members.map((member) =>
            member === oldHandle ? newHandle : member
          );
          await update(ref(db, `teams/${teamId}/members`), updatedMembers);
        }
        if (team.owner === oldHandle) {
          await update(ref(db, `teams/${teamId}`), { owner: newHandle });
        }
      }
    }

    // Update channels
    const channelsRef = ref(db, 'channels');
    const channelsSnapshot = await get(channelsRef);
    if (channelsSnapshot.exists()) {
      const channels = channelsSnapshot.val();
      for (const channelId in channels) {
        const channel = channels[channelId];
        if (channel.participants && channel.participants.includes(oldHandle)) {
          const updatedParticipants = channel.participants.map((participant) =>
            participant === oldHandle ? newHandle : participant
          );
          await update(ref(db, `channels/${channel.teamId}/${channelId}/participants`), updatedParticipants);
        }
      }
    }

    // Update direct chats
    const chatsRef = ref(db, 'chats');
    const chatsSnapshot = await get(chatsRef);
    if (chatsSnapshot.exists()) {
      const chats = chatsSnapshot.val();
      for (const chatId in chats) {
        const chat = chats[chatId];
        if (chat.members && chat.members.includes(oldHandle)) {
          const updatedMembers = chat.members.map((member) =>
            member === oldHandle ? newHandle : member
          );
          await update(ref(db, `chats/${chatId}`), { members: updatedMembers });
        }
      }
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 600,
        mx: "auto",
        p: 4,
        mt: 5,
        borderRadius: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>

      <Avatar
        alt={userData.handle}
        src={profilePicture}
        sx={{ width: 120, height: 120, margin: "auto", mb: 2 }}
      />

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TextField
          fullWidth
          variant="outlined"
          label="Username"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          variant="outlined"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          variant="outlined"
          label="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="Online">🟢 Online</MenuItem>
            <MenuItem value="Away">🟡 Away</MenuItem>
            <MenuItem value="Busy">🔴 Busy</MenuItem>
            <MenuItem value="Offline">⚪ Offline</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" component="label" sx={{ mb: 0, mr: 2 }}>
          Upload Profile Picture
          <input type="file" hidden onChange={handleProfilePictureChange} />
        </Button>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={handleSave}
        >
          Save
        </Button>
      </Box>
    </Paper>
  );
};

export default EditProfile;
