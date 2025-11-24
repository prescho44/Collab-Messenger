import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../store/app.context';
import { db, storage } from '../../configs/firebaseConfig';
import { ref as dbRef, update, get, set, remove } from 'firebase/database';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
  LinearProgress,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  checkEmailExists,
  checkHandleExists,
} from '../../services/user.service';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import defaultProfileImage from '../../assets/default-avatar.jpg';

const EditProfile = () => {
  const { userData, setAppState } = useContext(AppContext);
  const navigate = useNavigate();

  // State
  const [handle, setHandle] = useState(userData.handle || '');
  const [email, setEmail] = useState(userData.email || '');
  const [phoneNumber, setPhoneNumber] = useState(userData.phoneNumber || '');
  const [status, setStatus] = useState(userData.status || 'Online');
  const [profilePicture, setProfilePicture] = useState(
    userData.photo || '/default-avatar.jpg'
  );
  const [error, setError] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!avatarFile) {
      setProfilePicture(userData.photo || '/default-avatar.jpg');
      setImagePreview(userData.photo || '/default-avatar.jpg');
    }
  }, [userData.photo, avatarFile]);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 400,
      useWebWorker: true,
      initialQuality: 0.7,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  };

  const uploadImage = async (uid) => {
    if (!avatarFile) return userData.photo || defaultProfileImage;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const compressedImageFile = await compressImage(avatarFile);

      const timestamp = Date.now();
      const filename = `${timestamp}_${compressedImageFile.name}`;
      const storageRef = ref(storage, `avatars/${uid}/${filename}`);

      const uploadTask = uploadBytesResumable(storageRef, compressedImageFile);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            setIsUploading(false);
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setIsUploading(false);
              setUploadProgress(100);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      setIsUploading(false);
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setError('');
    setIsLoading(true);

    const emailExists = await checkEmailExists(email);
    if (emailExists && email !== userData.email) {
      setError('Email already exists');
      setIsLoading(false);
      return;
    }

    const handleExists = await checkHandleExists(handle);
    if (handleExists && handle !== userData.handle) {
      setError('Username already exists');
      setIsLoading(false);
      return;
    }

    const updates = {};
    if (email !== userData.email) updates.email = email;
    if (phoneNumber !== userData.phoneNumber) updates.phoneNumber = phoneNumber;
    if (status !== userData.status) updates.status = status;

    try {
      const profilePictureUrl = await uploadImage(userData.uid);
      updates.photo = profilePictureUrl;
      setProfilePicture(profilePictureUrl);
    } catch (uploadError) {
      setError('Failed to upload profile picture.');
      console.error('Upload error:', uploadError);
      setIsUploading(false);
      setIsLoading(false);
      return;
    }

    const oldHandle = userData.handle;
    const newHandle = handle;

    if (newHandle !== oldHandle) {
      // Ensure the new handle does not already exist
      const handleExists = await checkHandleExists(newHandle);
      if (handleExists) {
        setError('Username already exists');
        setIsLoading(false);
        return;
      }

      // Create a new user entry with the new handle
      const newUserRef = dbRef(db, `users/${newHandle}`);
      await set(newUserRef, {
        ...userData,
        ...updates,
        handle: newHandle,
      });

      // Delete the old user entry
      const oldUserRef = dbRef(db, `users/${oldHandle}`);
      await remove(oldUserRef);

      // Update references in teams and channels
      await updateReferences(oldHandle, newHandle);
    } else {
      // Update the existing user entry
      const userRef = dbRef(db, `users/${oldHandle}`);
      await update(userRef, updates);
    }

    // Update local state
    setAppState((prev) => ({
      ...prev,
      userData: {
        ...prev.userData,
        ...updates,
        handle: newHandle,
      },
    }));

    setIsLoading(false);
    navigate(`/profile/${userData.uid}`);
  };

  const updateReferences = async (oldHandle, newHandle) => {
    // Update teams
    const teamsRef = dbRef(db, 'teams');
    const teamsSnapshot = await get(teamsRef);
    if (teamsSnapshot.exists()) {
      const teams = teamsSnapshot.val();
      for (const teamId in teams) {
        const team = teams[teamId];
        if (team.members && team.members.includes(oldHandle)) {
          const updatedMembers = team.members.map((member) =>
            member === oldHandle ? newHandle : member
          );
      
          await update(dbRef(db, `teams/${teamId}`), { members: updatedMembers });
        }
        if (team.owner === oldHandle) {
          await update(dbRef(db, `teams/${teamId}`), { owner: newHandle });
        }
      }
    }

    // Update channels
    const channelsRef = dbRef(db, 'channels');
    const channelsSnapshot = await get(channelsRef);
    if (channelsSnapshot.exists()) {
      const channels = channelsSnapshot.val();
      for (const teamId in channels) {
        const teamChannels = channels[teamId];
        for (const channelId in teamChannels) {
          const channel = teamChannels[channelId];
          if (channel.participants && channel.participants.includes(oldHandle)) {
            const updatedParticipants = channel.participants.map((participant) =>
              participant === oldHandle ? newHandle : participant
            );
            await update(
              dbRef(db, `channels/${teamId}/${channelId}`),
              { participants: updatedParticipants }
            );
          }
        }
      }
    }

    // Update direct chats
    const chatsRef = dbRef(db, 'chats');
    const chatsSnapshot = await get(chatsRef);
    if (chatsSnapshot.exists()) {
      const chats = chatsSnapshot.val();
      for (const chatId in chats) {
        const chat = chats[chatId];
        if (chat.members && chat.members.includes(oldHandle)) {
          const updatedMembers = chat.members.map((member) =>
            member === oldHandle ? newHandle : member
          );
          await update(dbRef(db, `chats/${chatId}`), { members: updatedMembers });
        }
      }
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      setImagePreview(URL.createObjectURL(file));
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 600,
        mx: 'auto',
        p: 4,
        mt: 5,
        borderRadius: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>

      <Box
        sx={{
          position: 'relative',
          width: 120,
          height: 120,
          margin: 'auto',
          mb: 2,
        }}
      >
        <Avatar
          alt={userData.handle}
          src={imagePreview || profilePicture || defaultProfileImage}
          sx={{ width: 120, height: 120 }}
        />
        {isUploading && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '5px',
              textAlign: 'center',
            }}
          >
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{ height: 4 }}
            />
            <Typography variant="caption">{uploadProgress}%</Typography>
          </Box>
        )}
      </Box>

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

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <input
            type="file"
            id="profile-picture-upload"
            accept="image/*"
            onChange={handleProfilePictureChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="profile-picture-upload">
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
        </Box>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={handleSave}
          disabled={isUploading || isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </Box>
    </Paper>
  );
};

export default EditProfile;