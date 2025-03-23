import { useState, useContext, useEffect } from "react";
import { AppContext } from "../../store/app.context";
import { db } from "../../configs/firebaseConfig";
import { ref, update } from "firebase/database";
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
  const { userData } = useContext(AppContext);
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

    navigate(`/profile/${userData.uid}`);
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
