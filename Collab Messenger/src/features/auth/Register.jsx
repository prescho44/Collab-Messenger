import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/auth.service';
import { createUserHandle, getUserByHandle } from '../../services/user.service';
import { AppContext } from '../../store/app.context';
import { storage } from '../../configs/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import defaultProfileImage from '../../assets/default-avatar.jpg';
import imageCompression from 'browser-image-compression';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
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
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
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
    if (!imageFile) return defaultAvatar;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const compressedImageFile = await compressImage(imageFile);

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

  const register = async () => {
    if (!user.email || !user.password || !user.handle) {
      return alert('Please fill in all required fields');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return alert('Please enter a valid email address');
    }

    if (user.password.length < 6) {
      return alert('Password must be at least 6 characters long');
    }

    if (user.handle.length < 5 || user.handle.length > 35) {
      return alert('Username must be between 5 and 35 characters long');
    }

    try {
      const userFromDB = await getUserByHandle(user.handle);
      if (userFromDB) {
        throw new Error(`Username "${user.handle}" is already taken`);
      }

      const userCredential = await registerUser(user.email, user.password);

      const photoURL = await uploadImage(userCredential.user.uid);

      await createUserHandle(
        user.handle,
        userCredential.user.uid,
        user.email,
        photoURL,
        user.phoneNumber
      );

      setAppState({
        user: userCredential.user,
        userData: null,
      });

      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
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
    <Box
      component="main"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Paper elevation={3} sx={{ padding: 3, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" align="center" mb={2}>
          Create Account
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: 120,
                height: 120,
                marginBottom: 2,
              }}
            >
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
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{ height: 4 }}
                  />
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
          </Box>

          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={user.handle}
            onChange={updateUser('handle')}
            required
          />

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={user.email}
            onChange={updateUser('email')}
            type="email"
            required
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            value={user.password}
            onChange={updateUser('password')}
            type="password"
            required
          />

          <TextField
            label="Phone Number (Optional)"
            variant="outlined"
            fullWidth
            value={user.phoneNumber}
            onChange={updateUser('phoneNumber')}
            type="tel"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">+359</InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={register}
            disabled={isUploading}
          >
            {isUploading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Typography variant="body2" align="center" pt={2}  sx={{ borderTop: '1px solid #ccc' }}>
            Already have an account?{' '}
            <Link to="/login" style={{color: '#68c4ff', textDecoration: 'none'}}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
