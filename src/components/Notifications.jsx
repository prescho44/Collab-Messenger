import { useEffect, useState, useContext } from 'react';
import { ref, onValue, off, update } from 'firebase/database';
import { db } from '../configs/firebaseConfig';
import { AppContext } from '../store/app.context';
import {
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Notifications = () => {
  const { userData } = useContext(AppContext);
  const [channels, setChannels] = useState([]);
  const [newMessages, setNewMessages] = useState([]);
  const [teamsMap, setTeamsMap] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const navigate = useNavigate(); // Initialize the navigate function
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const teamsRef = ref(db, 'teams');
    onValue(teamsRef, (snapshot) => {
      const teamsData = snapshot.val();
      if (teamsData) {
        const teamsList = {};
        const channelsList = [];

        Object.entries(teamsData).forEach(([teamId, team]) => {
          teamsList[teamId] = {
            name: team.teamName || 'Unnamed Team',
            channels: team.channels || {},
          };

          const members = team.members
            ? Array.isArray(team.members)
              ? team.members
              : Object.keys(team.members)
            : [];

          if (
            members.includes(userData?.handle) ||
            team.owner === userData?.handle
          ) {
            if (team.channels) {
              Object.entries(team.channels).forEach(
                ([channelId, channelName]) => {
                  channelsList.push({ teamId, channelId, channelName });
                }
              );
            }
          }
        });

        setTeamsMap(teamsList);
        setChannels(channelsList);
      } else {
        setTeamsMap({});
        setChannels([]);
      }
    });
  }, [userData?.handle]);

  useEffect(() => {
    const listeners = channels.map(({ teamId, channelId }) => {
      const messagesRef = ref(db, `channels/${teamId}/${channelId}/messages`);
      const listener = onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          const messagesList = Object.entries(messagesData).map(
            ([id, message]) => ({
              id,
              ...message,
              timestamp: new Date(message.timestamp),
            })
          );

          const unreadMessages = messagesList.filter(
            (message) => !message.readBy || !message.readBy[userData?.uid]
          );

          if (unreadMessages.length > 0) {
            setNewMessages((prev) => [
              ...prev,
              ...unreadMessages.map((msg) => ({
                id: msg.id,
                sender: msg.senderName,
                content: msg.content,
                teamId,
                channelId,
                readBy: msg.readBy,
              })),
            ]);
          }
        }
      });

      return { messagesRef, listener };
    });

    return () => {
      listeners.forEach(({ messagesRef, listener }) => {
        off(messagesRef, listener);
      });
    };
  }, [channels, teamsMap, userData?.handle, userData?.uid]);

  useEffect(() => {
    const friendsRef = ref(db, `users/${userData?.handle}/friends`);
    const listener = onValue(friendsRef, (snapshot) => {
      if (snapshot.exists()) {
        const friendsData = snapshot.val();
        const pendingRequests = Object.entries(friendsData)
          .filter(([, friend]) => friend.friendAccepted === false)
          .map(([handle, friend]) => ({ handle, ...friend }));
        setFriendRequests(pendingRequests);
      } else {
        setFriendRequests([]);
      }
    });

    return () => {
      off(friendsRef, listener);
    };
  }, [userData?.handle]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleInvationClick = () => {
    navigate('/friends');
    handleMenuClose();
  }

  const markMessagesAsRead = () => {
    newMessages.forEach((msg) => {
      const messageRef = ref(
        db,
        `channels/${msg.teamId}/${msg.channelId}/messages/${msg.id}`
      );
      update(messageRef, {
        readBy: {
          ...(msg.readBy || {}),
          [userData.handle]: true,
        },
      });
    });
    setNewMessages([]);
  };

  const handleMessageClick = (msg) => {
    // Remove the clicked message from the notifications list
    setNewMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== msg.id)
    );

    // Navigate to the specific chat based on teamId and channelId
    navigate(`/teams/${msg.teamId}/channels/${msg.channelId}`);
  };

  return (
    <>
      {/* Always show the notification icon, but conditionally render the badge */}
      <div color="inherit" onClick={handleMenuOpen}>
        {userData?.status === 'Online' ? (
          <Badge badgeContent={newMessages.length} color="error">
            <CircleNotificationsIcon sx={{ fontSize: 30 }} />
          </Badge>
        ) : (
          <CircleNotificationsIcon sx={{ fontSize: 30 }} />
        )}
      </div>

      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
        {newMessages.length > 0 || friendRequests.length > 0 ? (
          [
            ...newMessages.map((msg) => (
              <MenuItem key={msg.id} onClick={() => handleMessageClick(msg)}>
                <Box>
                  <Typography variant="body2">
                    <strong>{msg.sender}:</strong> {msg.content}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    From: {teamsMap[msg.teamId]?.name || 'Unknown Team'} -{' '}
                    {teamsMap[msg.teamId]?.channels[msg.channelId] ||
                      'Unknown Channel'}
                  </Typography>
                </Box>
              </MenuItem>
            )),
            ...friendRequests.map((request) => (
              <MenuItem key={request.uid} onClick={handleInvationClick}>
                <Box>
                  <Typography variant="body2">
                    <strong>Friend Request</strong> to {request.handle}
                  </Typography>
                </Box>
              </MenuItem>
            )),
            <Divider key="divider" />,
            <MenuItem key="clear" onClick={markMessagesAsRead}>
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="button" color="error">
                  Clear
                </Typography>
              </Box>
            </MenuItem>,
          ]
        ) : (
          <MenuItem onClick={handleMenuClose}>No new messages</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default Notifications;
