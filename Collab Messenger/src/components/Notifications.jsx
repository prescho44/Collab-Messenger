import { useEffect, useState, useContext } from "react";
import { ref, onValue, off, update } from "firebase/database";
import { db } from "../configs/firebaseConfig";
import { AppContext } from "../store/app.context";
import {
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Divider,
  Button,
  Typography,
  Box,
} from "@mui/material";
import CircleNotificationsIcon from "@mui/icons-material/CircleNotifications";

const Notifications = () => {
  const { userData } = useContext(AppContext);
  const [channels, setChannels] = useState([]);
  const [newMessages, setNewMessages] = useState([]);
  const [teamsMap, setTeamsMap] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    const teamsRef = ref(db, "teams");
    onValue(teamsRef, (snapshot) => {
      const teamsData = snapshot.val();
      if (teamsData) {
        const teamsList = {};
        const channelsList = [];

        Object.entries(teamsData).forEach(([teamId, team]) => {
          teamsList[teamId] = {
            name: team.teamName || "Unnamed Team",
            channels: team.channels || {},
          };

          const members = team.members
            ? Array.isArray(team.members)
              ? team.members
              : Object.keys(team.members)
            : [];

          if (members.includes(userData?.handle) || team.owner === userData?.handle) {
            if (team.channels) {
              Object.entries(team.channels).forEach(([channelId, channelName]) => {
                channelsList.push({ teamId, channelId, channelName });
              });
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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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

  return (
      <><IconButton color="inherit" onClick={handleMenuOpen}>
      <Badge badgeContent={newMessages.length} color="error">
        <CircleNotificationsIcon sx={{ fontSize: 30 }} />
      </Badge>
    </IconButton><Menu
      anchorEl={anchorEl}
      open={menuOpen}
      onClose={handleMenuClose}
    >
        {newMessages.length > 0 ? (
          [
              ...newMessages.map((msg) => (
                <MenuItem key={msg.id} onClick={handleMenuClose}>
                  <Box>
                    <Typography variant="body2">
                      <strong>{msg.sender}:</strong> {msg.content}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      From: {teamsMap[msg.teamId]?.name || "Unknown Team"} -{" "}
                      {teamsMap[msg.teamId]?.channels[msg.channelId] || "Unknown Channel"}
                    </Typography>
                  </Box>
                </MenuItem>
              )),
            < Divider key="divider"/>,

            <MenuItem key="clear">
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={markMessagesAsRead}
              >
                Clear
              </Button>
            </MenuItem>
          ]
        ) : (
          <MenuItem onClick={handleMenuClose}>No new messages</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default Notifications;
