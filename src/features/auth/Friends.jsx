import { AppContext } from '../../store/app.context';
import { useEffect, useState, useContext } from 'react';
import { db } from '../../configs/firebaseConfig';
import { ref, onValue, remove, update } from 'firebase/database';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  Avatar,
  ListItemAvatar,
  Box,
  Button,
  Grid,
} from '@mui/material';

const Friends = () => {
  const { userData } = useContext(AppContext);
  const [friends, setFriends] = useState([]);
  const [pendingFriends, setPendingFriends] = useState([]);

  useEffect(() => {
    const friendsRef = ref(db, `users/${userData.handle}/friends`);
    const unsubscribe = onValue(friendsRef, (snapshot) => {
      const friendsData = snapshot.val();
      if (friendsData) {
        const acceptedFriends = Object.values(friendsData).filter(
          (friend) => friend.friendAccepted === true
        );
        const pending = Object.values(friendsData).filter(
          (friend) =>
            friend.friendAccepted === false || friend.friendAccepted === null
        );

        setFriends(acceptedFriends);
        setPendingFriends(pending);
      } else {
        setFriends([]);
        setPendingFriends([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userData.handle]);

  const handleRemoveFriend = async (friendHandle) => {
    const currentUserFriendsRef = ref(
      db,
      `users/${userData.handle}/friends/${friendHandle}`
    );
    const otherUserFriendsRef = ref(
      db,
      `users/${friendHandle}/friends/${userData.handle}`
    );
    await remove(currentUserFriendsRef);
    await remove(otherUserFriendsRef);
  };

  const handleAcceptFriend = async (friendHandle) => {
    const currentUserFriendsRef = ref(
      db,
      `users/${userData.handle}/friends/${friendHandle}`
    );
    await update(currentUserFriendsRef, { friendAccepted: true });

    const otherUserFriendsRef = ref(
      db,
      `users/${friendHandle}/friends/${userData.handle}`
    );
    await update(otherUserFriendsRef, { friendAccepted: true });
  };

  return (
    <Paper
      elevation={4}
      sx={{ maxWidth: 600, mx: 'auto', p: 4, mt: 5, borderRadius: 3 }}
    >
      <Typography variant="h4" gutterBottom>
        Friends
      </Typography>
      <List>
        {friends.map((friend) => (
          <ListItem
            key={friend.uid}
            sx={{
              alignItems: 'center',
              padding: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              mb: 1,
              boxShadow: 1,
            }}
          >
            <Grid container spacing={8} alignItems="center">
              <Grid item xs={12} sm={1}>
                <ListItemAvatar>
                  <Avatar alt={friend.handle} src={friend.photo} />
                </ListItemAvatar>
              </Grid>
              <Grid item xs={8} sm={6}>
                <ListItemText
                  primary={
                    <>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        component="span"
                      >
                        {friend.handle}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="span"
                        display="block"
                      >
                        {friend.email}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="span"
                        display="block"
                      >
                        Status: {friend.status}{' '}
                        {friend.status === 'Online'
                          ? '🟢'
                          : friend.status === 'Busy'
                          ? '🔴'
                          : friend.status === 'Away'
                          ? '🟡'
                          : '⚪'}
                      </Typography>
                    </>
                  }
                />
              </Grid>
              <Grid item xs={4} sm={2} textAlign="right">
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveFriend(friend.handle)}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>

      {/* Display Pending Friend Requests */}
      {pendingFriends.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Pending Friend Requests
          </Typography>
          <List>
            {pendingFriends.map((friend) => (
              <ListItem
                key={friend.uid}
                sx={{
                  alignItems: 'center',
                  padding: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  mb: 1,
                  boxShadow: 1,
                }}
              >
                <Grid container spacing={8} alignItems="center">
                  <Grid item xs={12} sm={1}>
                    <ListItemAvatar>
                      <Avatar alt={friend.handle} src={friend.photo} />
                    </ListItemAvatar>
                  </Grid>
                  <Grid item xs={8} sm={6}>
                    <ListItemText
                      primary={
                        <>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            component="span"
                          >
                            {friend.handle}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="span"
                            display="block"
                          >
                            {friend.email}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="span"
                            display="block"
                          >
                            Status: {friend.status}{' '}
                            {friend.status === 'Online'
                              ? '🟢'
                              : friend.status === 'Busy'
                              ? '🔴'
                              : friend.status === 'Away'
                              ? '🟡'
                              : '⚪'}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            style={{ color: 'orange' }}
                            component="span"
                            display="block"
                          >
                            Friend request is pending...
                          </Typography>
                        </>
                      }
                    />
                  </Grid>
                  <Grid item xs={4} sm={2} textAlign="right">
                    {friend.friendAccepted === false &&
                      friend.requestFrom !== userData.handle && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleAcceptFriend(friend.handle)}
                        >
                          Accept
                        </Button>
                      )}
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

export default Friends;
