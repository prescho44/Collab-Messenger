import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserData } from '../../services/user.service';
import { Avatar, Box, Typography, CircularProgress, Button } from '@mui/material';

const Profile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      })
      .catch((error) => {
        console.error('Error fetching user data:', error); // Debug log
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!userData) {
    return <Typography variant="h6">No user data available</Typography>;
  }

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Avatar
        alt={userData.name}
        src={userData.profilePicture || '/default-avatar.jpg'}
        sx={{ width: 100, height: 100, margin: 'auto' }}
      />
      <Typography variant="h4" mt={2}>
        {userData.username}
      </Typography>
      <Typography variant="body2" mt={1}>
        {userData.email}
      </Typography>
      <Typography variant="body2" mt={1}>
        {userData.handle}
      </Typography>
      <Typography variant="body2" mt={1}>
        {userData.phoneNumber}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" sx={{ mr: 2 }}>
          Send Message
        </Button>
        <Button variant="contained" color="primary">
          Invite to Team
        </Button>
      </Box>
      
    </Box>
  );
};

export default Profile;
