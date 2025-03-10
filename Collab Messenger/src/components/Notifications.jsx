import { useEffect, useState, useContext } from "react";
import { ref, onValue, off, update } from "firebase/database";
import { db } from "../configs/firebaseConfig";
import { AppContext } from "../store/app.context";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Menu,
  MenuItem,
  IconButton,
  Badge,
} from "@mui/material";
import CircleNotificationsIcon from "@mui/icons-material/CircleNotifications";

const Notifications = () => {
  const { userData } = useContext(AppContext);
  const [channels, setChannels] = useState([]);
  const [newMessages, setNewMessages] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // Listen for new messages in all channels
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

          const newMessages = messagesList.filter(
            (message) => !message.readBy || !message.readBy[userData?.uid]
          );

          if (newMessages.length > 0) {
            console.log("New messages found:", newMessages);
            setNewMessages(newMessages.map((msg) => ({
              id: msg.id,
              sender: msg.senderName,
              content: msg.content,
              teamId,
              channelId,
              readBy: msg.readBy,
            })));

            newMessages.forEach((message) => {
              if (message.sender !== userData?.handle) {
                toast.info(`New message from ${message.sender}: ${message.content}`);
              }
            });
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
  }, [channels, userData?.handle]);

  // Get all channels user is a part of
  useEffect(() => {
    const teamsRef = ref(db, "teams");
    onValue(teamsRef, (snapshot) => {
      const teamsData = snapshot.val();
      if (teamsData) {
        const channelsList = [];
        Object.entries(teamsData).forEach(([teamId, team]) => {
          const members = team.members ? (Array.isArray(team.members) ? team.members : Object.keys(team.members)) : [];
          if (members.includes(userData?.handle) || team.owner === userData?.handle) {
            if (team.channels) {
              Object.keys(team.channels).forEach((channelId) => {
                channelsList.push({ teamId, channelId });
              });
            }
          }
        });
        setChannels(channelsList);
      } else {
        setChannels([]);
      }
    });
  }, [userData?.handle]);

  // Open/close dropdown
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    // Mark messages as read
    newMessages.forEach((msg) => {
      const messageRef = ref(db, `channels/${msg.teamId}/${msg.channelId}/messages/${msg.id}`);
      update(messageRef, {
        readBy: {
          ...(msg.readBy || {}),
          [userData.handle]: true,
        },
      });
    });
    setNewMessages([]); // Clears notifications when opened
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleMenuOpen}>
        <Badge badgeContent={newMessages.length} color="error">
          <CircleNotificationsIcon sx={{ fontSize: 30 }} />
        </Badge>
      </IconButton>

      {/* Notification Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        sx={{ mt: 2 }}
      >
        {newMessages.length > 0 ? (
          newMessages.map((msg) => (
            <MenuItem key={msg.id} onClick={handleMenuClose}>
              <strong>{msg.sender}:</strong> {msg.content}
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleMenuClose}>No new messages</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default Notifications;