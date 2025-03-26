import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserData } from '../../services/user.service';
import { createDirectChat } from '../../components/DirectChat/CreateDirectChat';
import {
  Avatar,
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
} from '@mui/material';
import { AppContext } from '../../store/app.context';
import { db } from '../../configs/firebaseConfig';
import { ref, set } from 'firebase/database';

const Profile = ({ userId }) => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);
  const [otherUserData, setOtherUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editedData, setEditedData] = useState({});
  const [sendMessageLoading, setSendMessageLoading] = useState(false);
  const [friendRequestLoading, setFriendRequestLoading] = useState(false);

  useEffect(() => {
    if (!uid) {
      console.error('No uid provided');
      setLoading(false);
      return;
    }

    getUserData(uid)
      .then((data) => {
        setOtherUserData(data);
        setEditedData(data);

       
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [uid]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendMessageLoading(true);
    try {
      const chatId = await createDirectChat(userData, otherUserData);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating direct chat:', error.message);
    } finally {
      setSendMessageLoading(false);
    }
  };

  const handleAddFriend = async () => {
    setFriendRequestLoading(true);
    try {
      const currentUserFriendsRef = ref(
        db,
        `users/${userData.handle}/friends/${otherUserData.handle}`
      );
      await set(currentUserFriendsRef, {
        uid: otherUserData.uid,
        handle: otherUserData.handle,
        email: otherUserData.email,
        photo: otherUserData.photo || '/src/assets/default-avatar.jpg',
        status: otherUserData.status || 'Online',
        friendAccepted: false,
        requestFrom: userData.handle,
      });

      const otherUserFriendsRef = ref(
        db,
        `users/${otherUserData.handle}/friends/${userData.handle}`
      );

      await set(otherUserFriendsRef, {
        uid: userData.uid,
        handle: userData.handle,
        email: userData.email,
        photo: userData.photo || '/src/assets/default-avatar.jpg',
        status: userData.status || 'Online',
        friendAccepted: false,
        requestFrom: userData.handle,
      });
    } catch (error) {
      console.error('Error adding friend:', error.message || error);
    } finally {
      setFriendRequestLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  }

  if (!otherUserData) {
    return (
      <Typography variant="h6" align="center">
        No user data available
      </Typography>
    );
  }

  const isOwnProfile = uid === userId;

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 450,
        mx: 'auto',
        p: 4,
        mt: 5,
        textAlign: 'center',
        borderRadius: 3,
      }}
    >
      <Avatar
        alt={otherUserData.handle}
        src={otherUserData.photo || editedData.photo}
        sx={{ width: 120, height: 120, margin: 'auto', mb: 2 }}
      />
      <Typography variant="h4" mt={2}>
        {otherUserData.username}
      </Typography>
      <Typography variant="body2" mt={1}>
        {otherUserData.email}
      </Typography>
      <Typography variant="body2" mt={1}>
        {otherUserData.handle}
      </Typography>
      <Typography variant="body2" mt={1}>
        {otherUserData.phoneNumber}
      </Typography>

      {/* Displaying Status */}
      <Typography variant="body2" mt={1} color="textSecondary">
        Status: {otherUserData.status || 'No status set'}
      </Typography>
      {isOwnProfile ? (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditProfile}
          >
            Edit Profile
          </Button>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            onClick={handleSendMessage}
            disabled={sendMessageLoading}
          >
            {sendMessageLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Send Message'
            )}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddFriend}
            disabled={friendRequestLoading}
          >
            {friendRequestLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Add Friend'
            )}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default Profile;