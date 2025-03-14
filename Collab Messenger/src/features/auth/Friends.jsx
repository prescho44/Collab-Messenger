import { AppContext } from '../../store/app.context';
import {useEffect, useState, useContext} from 'react';
import { db } from '../../configs/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Typography, List, ListItem, ListItemText, Paper } from '@mui/material';



const Friends = () => {
    const { userData } = useContext(AppContext);
    const [friends, setFriends] = useState([]);
  
    useEffect(() => {
      const friendsRef = ref(db, `users/${userData.uid}/friends`);
      onValue(friendsRef, (snapshot) => {
        const friendsData = snapshot.val();
        if (friendsData) {
          setFriends(Object.values(friendsData));
        } else {
          setFriends([]);
        }
      });
    }, [userData.uid]);
  
    return (
        <Paper elevation={4} sx={{ maxWidth: 600, mx: 'auto', p: 4, mt: 5, borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom>
            Friends
          </Typography>
          <List>
            {friends.map((friend) => (
              <ListItem key={friend.uid}>
                <ListItemText primary={friend.username} secondary={friend.email} />
              </ListItem>
            ))}
          </List>
        </Paper>
      );
    };
    
    export default Friends;