import {useState, useContext} from 'react';
import {AppContext} from '../../store/app.context';
import { db } from '../../configs/firebaseConfig';
import { ref, update } from 'firebase/database';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

const EditProfile = () => {
    const { userData } = useContext(AppContext);
    const [handle, setHandle] = useState(userData.handle || '');
    const [email, setEmail] = useState(userData.email || '');
    const [username, setUsername] = useState(userData.username || '');
    const [profilePicture, setProfilePicture] = useState(userData.profilePicture || '');

const handleSave = async () => {
    const userRef = ref(db, `users/${userData.uid}`);
    await update(userRef, {
    handle: handle || userData.handle || '',
    email: email || userData.email || '',
    username: username || userData.username || '',
    profilePicture: profilePicture || userData.profilePicture || '',
    });
};

const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file.name);
  };

  return (
    <Paper elevation={4} sx={{ maxWidth: 600, mx: 'auto', p: 4, mt: 5, borderRadius: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Handle"
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
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" component="label" sx={{ mb: 2 }}>
          Upload Profile Picture
          <input type="file" hidden onChange={handleProfilePictureChange} />
        </Button>
        <Button variant="contained" color="primary" type="submit">
          Save
        </Button>
      </Box>
    </Paper>
  );
}

export default EditProfile;