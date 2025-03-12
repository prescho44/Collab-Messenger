import { useEffect, useState } from 'react';
import { getUserData, updateUserData, checkEmailExists } from '../../services/user.service';
import {
  Avatar,
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Paper,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const Profile = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [emailError, setEmailError] = useState('');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.error('No uId provided');
      setLoading(false);
      return;
    }

    getUserData(userId)
      .then((data) => {
        console.log('Fetched user data:', data); // Debug log
        setUserData(data);
        setEditedData(data);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  }

  if (!userData) {
    return <Typography variant="h6" align="center">No user data available</Typography>;
  }

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    e.preventDefault();
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setEditedData({ ...editedData, photo: URL.createObjectURL(file) });
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSave = () => {
    if (!emailRegex.test(editedData.email)) {
      setEmailError('Email is invalid');
      return;
    }

    if (editedData.email === userData.email) {
      saveUserData();
      return;
    }

    checkEmailExists(editedData.email)
      .then((exists) => {
        if (exists) {
          setEmailError('Email already exists');
        } else {
          setEmailError('');
          saveUserData();
        }
      })
      .catch((error) => {
        console.error('Error checking email:', error);
      });
  };

  const saveUserData = () => {
    updateUserData(userId, editedData)
      .then(() => {
        setUserData(editedData);
        setEditMode(false);
      })
      .catch((error) => {
        console.error('Error updating user data:', error);
      });
  };

  return (
    <Paper elevation={4} sx={{ maxWidth: 450, mx: 'auto', p: 4, mt: 5, textAlign: 'center', borderRadius: 3 }}>
      <Avatar
        alt={userData.handle}
        src={editedData.photo || '/default-avatar.jpg'}
        sx={{ width: 120, height: 120, margin: 'auto', mb: 2 }}
      />
      {editMode && (
        <Button variant="contained" component="label" sx={{ mb: 2 }}>
          Change Avatar
          <input type="file" hidden onChange={handleAvatarChange} />
        </Button>
      )}
      {editMode ? (
        <>
          <TextField
            name="handle"
            label="Username"
            value={editedData.handle}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            name="email"
            label="Email"
            value={editedData.email}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
            error={!!emailError}
            helperText={emailError}
          />
          <TextField
            name="phoneNumber"
            label="Phone Number"
            value={editedData.phoneNumber}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
        </>
      ) : (
        <>
          <Typography variant="h5" fontWeight="bold">
            {userData.handle}
          </Typography>
          <Typography variant="body1" color="textSecondary" mt={1}>
            {userData.email}
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            {userData.phoneNumber}
          </Typography>
        </>
      )}
      <Box mt={3}>
        {editMode ? (
          <>
            <IconButton color="primary" onClick={handleSave} sx={{ mr: 1 }}>
              <SaveIcon />
            </IconButton>
            <IconButton color="error" onClick={() => setEditMode(false)}>
              <CancelIcon />
            </IconButton>
          </>
        ) : (
          <IconButton color="secondary" onClick={handleEdit}>
            <EditIcon />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
};

export default Profile;
