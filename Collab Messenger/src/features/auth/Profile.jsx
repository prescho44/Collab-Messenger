import { useEffect, useState } from 'react';
import { getUserData } from '../../services/user.service';
import { Avatar, Box, Typography, CircularProgress } from '@mui/material';

const Profile = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      console.error('No userId provided');
      setLoading(false);
      return;
    }

    console.log('Fetching user data for userId:', userId); // Debug log
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
        {userData.name}
      </Typography>
      <Typography variant="body1" mt={1}>
        {userData.email}
      </Typography>
      <Typography variant="body2" mt={1}>
        {userData.bio}
      </Typography>
      <Typography variant="body2" mt={1}>
        {userData.location}
      </Typography>
      {/* Add more user details here */}
    </Box>
  );
};

export default Profile;
