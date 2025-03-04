import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/auth.service';
import { createUserHandle, getUserByHandle } from '../../services/user.service';
import { AppContext } from '../../store/app.context';
import { storage } from '../../configs/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import defaultProfileImage from '../../assets/default-avatar.jpg';
import { Box, Button, CircularProgress, Grid, TextField, Typography, Paper, InputAdornment, IconButton, LinearProgress, Link } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

export default function Register() {
  const { setAppState } = useContext(AppContext);
  const [user, setUser] = useState({
    handle: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const defaultAvatar = defaultProfileImage;

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (uid) => {
    if (!imageFile) return defaultAvatar;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create a unique filename using timestamp
      const timestamp = Date.now();
      const filename = `${timestamp}_${imageFile.name}`;
      const storageRef = ref(storage, `avatars/${uid}/${filename}`);

      // Create upload task with progress monitoring
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      // Monitor upload progress
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

  const register = async () => {
    // Validate required fields
    if (!user.email || !user.password || !user.handle) {
      return alert('Please fill in all required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return alert('Please enter a valid email address');
    }

    // Validate password strength
    if (user.password.length < 6) {
      return alert('Password must be at least 6 characters long');
    }

    try {
      // Check if username is taken
      const userFromDB = await getUserByHandle(user.handle);
      if (userFromDB) {
        throw new Error(`Username "${user.handle}" is already taken`);
      }

      // Register user
      const userCredential = await registerUser(user.email, user.password);
      console.log('User registered:', userCredential.user.uid); // Debug log      
      // Upload profile image
      const photoURL = await uploadImage(userCredential.user.uid);
      console.log('Photo uploaded:', photoURL); // Debug log

      // Create user profile
      await createUserHandle(
        user.handle,
        userCredential.user.uid,
        user.email,
        photoURL,
        user.phoneNumber
      );

      // Update app state
      setAppState({
        user: userCredential.user,
        userData: null,
      });

      // Redirect to home
      navigate('/');

    } catch (error) {
      console.error('Registration error:', error); // Detailed error logging
      alert(error.message);
    }
  };

  const updateUser = (prop) => (e) => {
    setUser({
      ...user,
      [prop]: e.target.value,
    });
  };

  return (
    <Box component="main" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ padding: 3, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" align="center" mb={2}>
          Create Account
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} textAlign="center">
            <Box sx={{ position: 'relative', width: 120, height: 120, margin: '0 auto' }}>
              <img
                src={imagePreview || defaultAvatar}
                alt="Profile Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #fff',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                }}
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
                  <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 4 }} />
                  <Typography variant="caption">{uploadProgress}%</Typography>
                </Box>
              )}
            </Box>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="photo">
              <IconButton color="primary" component="span">
                <PhotoCamera />
              </IconButton>
            </label>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={user.handle}
              onChange={updateUser('handle')}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={user.email}
              onChange={updateUser('email')}
              type="email"
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              value={user.password}
              onChange={updateUser('password')}
              type="password"
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Phone Number (Optional)"
              variant="outlined"
              fullWidth
              value={user.phoneNumber}
              onChange={updateUser('phoneNumber')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton edge="start">
                      <PhotoCamera />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={register}
              disabled={isUploading}
            >
              {isUploading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Grid>

          {/* "Already have an account?" link */}
          <Typography variant="body2" align="center" mt={3}>
          Already have an account?{' '}
          <Link href="/login" variant="body2" sx={{ color: '#1976d2' }}>
            Sign up
          </Link>
        </Typography>
        </Grid>
      </Paper>
    </Box>
  );
}
