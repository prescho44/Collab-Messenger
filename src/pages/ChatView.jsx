import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../configs/firebaseConfig";
import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
  get,
  off,
} from "firebase/database";
import { AppContext } from "../store/app.context";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Menu,
  MenuItem,
  Popover,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import Chats from "./Chats";
import Picker from "emoji-picker-react";
import { ThemeContext } from "../store/theme.context";
import MessageInput from "../components/Messages/MessageInput";
import MessageList from "../components/Messages/MessageList";

const ChatView = () => {
  const { teamId, channelId } = useParams();
  const { themeMode } = useContext(ThemeContext);
  const { user, userData } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [channelName, setChannelName] = useState("");
  const navigate = useNavigate();
  const messagesRef = ref(db, `channels/${teamId}/${channelId}/messages`);
  const channelRef = ref(db, `channels/${teamId}/${channelId}`);

  useEffect(() => {
    if (!teamId || !channelId) return;

    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesList = Object.entries(messagesData).map(
          ([id, message]) => ({
            id,
            ...message,
            timestamp: new Date(message.timestamp),
          })
        );

        // Mark messages as read
        messagesList.forEach((message) => {
          if (!message.readBy || !message.readBy[user.uid]) {
            const messageRef = ref(
              db,
              `channels/${teamId}/${channelId}/messages/${message.id}`
            );
            update(messageRef, {
              readBy: {
                ...(message.readBy || {}),
                [user.uid]: true,
              },
            });
          }
        });

        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    const unsubscribeChannel = onValue(channelRef, (snapshot) => {
      if (snapshot.exists()) {
        const channelData = snapshot.val();
        setChannelName(channelData.title);
      }
    });

    const teamRef = ref(db, `teams/${teamId}`);
    const unsubscribeTeam = onValue(teamRef, (snapshot) => {
      if (snapshot.exists()) {
        const teamData = snapshot.val();
        setIsOwner(teamData.owner === userData.handle);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeChannel();
      unsubscribeTeam();
    };
  }, [teamId, channelId, user.uid]);

  const handleSendMessage = async (content, gifUrl, type) => {
    if (!content.trim() && !gifUrl) return;

    try {
      const newMessageRef = push(messagesRef);

      await set(newMessageRef, {
        content,
        gifUrl,
        type,
        sender: user.uid,
        timestamp: new Date().toString(),
        senderName: userData?.handle,
        senderPhoto: userData?.photo,
        edited: false,
        readBy: {
          [user.uid]: true,
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleMenuClick = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleEditMessage = async () => {
    if (!selectedMessage) return;

    const newContent = prompt("Edit your message:", selectedMessage.content);
    if (newContent === null || newContent.trim() === "") return;

    try {
      const messageRef = ref(
        db,
        `channels/${teamId}/${channelId}/messages/${selectedMessage.id}`
      );
      await update(messageRef, {
        content: newContent,
        edited: true,
      });
      handleMenuClose();
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      const messageRef = ref(
        db,
        `channels/${teamId}/${channelId}/messages/${selectedMessage.id}`
      );
      await remove(messageRef);
      handleMenuClose();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleReactMessage = (event) => {
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleEmojiSelect = async (emojiObject) => {
    if (!selectedMessage) return;

    const emoji = emojiObject.emoji;

    try {
      const messageRef = ref(
        db,
        `channels/${teamId}/${channelId}/messages/${selectedMessage.id}`
      );

      const reactions = selectedMessage.reactions || {};
      const existingReaction = Object.entries(reactions).find(
        ([, users]) => users[user.uid]
      );

      if (existingReaction && existingReaction[0] === emoji) {
        const { [emoji]: currentEmoji, ...remainingReactions } = reactions;
        const { [user.uid]: _, ...remainingUsers } = currentEmoji;

        await update(messageRef, {
          reactions: {
            ...remainingReactions,
            ...(Object.keys(remainingUsers).length > 0 && {
              [emoji]: remainingUsers,
            }),
          },
        });
      } else {
        if (existingReaction) {
          const [prevEmoji] = existingReaction;
          delete reactions[prevEmoji][user.uid];
        }

        await update(messageRef, {
          reactions: {
            ...reactions,
            [emoji]: {
              ...(reactions[emoji] || {}),
              [user.uid]: true,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error updating reaction:", error);
    }

    setEmojiAnchorEl(null);
    handleMenuClose();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLeaveChannel = async () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to leave this channel?"
    );

    if (!userConfirmed) return;

    try {
      const participantsRef = ref(
        db,
        `channels/${teamId}/${channelId}/participants`
      );
      const snapshot = await get(participantsRef);

      if (snapshot.exists()) {
        const participants = snapshot.val();
        const updatedParticipants = participants.filter(
          (participant) => participant !== userData?.handle
        );
        await set(participantsRef, updatedParticipants);
      }

      // Remove the listener for the messages in this channel
      off(messagesRef);

      navigate("/");
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  };

  const handleLeaveTeam = async () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to leave this team? This will remove you from the team and all its channels."
    );

    if (!userConfirmed) return;

    try {
      const teamMembersRef = ref(db, `teams/${teamId}/members`);
      const teamMembersSnapshot = await new Promise((resolve) =>
        onValue(teamMembersRef, (snap) => resolve(snap.val()), {
          onlyOnce: true,
        })
      );
      const teamMembers = teamMembersSnapshot || [];
      const updatedTeamMembers = teamMembers.filter(
        (member) => member !== userData.handle
      );
      await set(teamMembersRef, updatedTeamMembers);

      // Remove user from all channels in the team
      const channelsRef = ref(db, `channels/${teamId}`);
      const channelsSnapshot = await new Promise((resolve) =>
        onValue(channelsRef, (snap) => resolve(snap.val()), { onlyOnce: true })
      );
      const channels = channelsSnapshot || {};
      for (const channelId in channels) {
        const participantsRef = ref(
          db,
          `channels/${teamId}/${channelId}/participants`
        );
        const participantsSnapshot = await new Promise((resolve) =>
          onValue(participantsRef, (snap) => resolve(snap.val()), {
            onlyOnce: true,
          })
        );
        const participants = participantsSnapshot || [];
        const updatedParticipants = participants.filter(
          (participant) => participant !== userData.uid
        );
        await set(participantsRef, updatedParticipants);

        // Remove the listener for the messages in this channel
        const channelMessagesRef = ref(
          db,
          `channels/${teamId}/${channelId}/messages`
        );
        off(channelMessagesRef);
      }

      // Update local state
      setMessages([]);
      navigate("/");
    } catch (error) {
      console.error("Error leaving team:", error);
    }
  };

  const handleDeleteTeam = async () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete this team? This action cannot be undone."
    );

    if (!userConfirmed) return;
    try {
      // Delete all channels in the team
      const channelsRef = ref(db, `channels/${teamId}`);
      const channelsSnapshot = await get(channelsRef);
      if (channelsSnapshot.exists()) {
        const channels = channelsSnapshot.val();
        for (const channelId in channels) {
          const channelMessagesRef = ref(
            db,
            `channels/${teamId}/${channelId}/messages`
          );
          await remove(channelMessagesRef);
          const participantsRef = ref(
            db,
            `channels/${teamId}/${channelId}/participants`
          );
          await remove(participantsRef);
          await remove(ref(db, `channels/${teamId}/${channelId}`));
        }
      }

      // Delete the team
      const teamRef = ref(db, `teams/${teamId}`);
      await remove(teamRef);

      // Navigate to the home page
      navigate("/");
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        overflow: "hidden",
        display: "flex",
      }}
    >
      {/* Sidebar - Chats Component */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "20%",
          ml: 3,
          overflowY: "auto",
          overflowX: "hidden",
          overflow: "height",
        }}
      >
        <Chats />
      </Box>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            p: 2,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flexGrow: 1, textAlign: "center" }}>
            <Typography variant="h6">{channelName}</Typography>
          </Box>
          <IconButton
            sx={{ marginInline: 1 }}
            color="primary"
            onClick={() => navigate("/video-call/" + teamId + "/" + channelId)}
          >
            <VideoCallIcon />
          </IconButton>
          <IconButton
            sx={{ marginInline: 1 }}
            color="primary"
            onClick={handleMenuOpen}
          >
            <MoreHorizIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={closeMenu}
          >
            {isOwner
              ? [
                  <MenuItem key="leave-channel" onClick={handleLeaveChannel}>
                    Leave Channel
                  </MenuItem>,
                  <MenuItem key="delete-team" onClick={handleDeleteTeam}>
                    Delete Team
                  </MenuItem>,
                ]
              : [
                  <MenuItem key="leave-channel" onClick={handleLeaveChannel}>
                    Leave Channel
                  </MenuItem>,
                  <MenuItem key="leave-team" onClick={handleLeaveTeam}>
                    Leave Team
                  </MenuItem>,
                ]}
          </Menu>
        </Box>

        <MessageList
          messages={messages}
          user={user}
          handleMenuClick={handleMenuClick}
          formatTime={formatTime}
        />

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          
        >
          {selectedMessage?.sender === user.uid ? (
            <>
              <MenuItem onClick={handleEditMessage}>Edit</MenuItem>
              <MenuItem onClick={handleDeleteMessage}>Delete</MenuItem>
            </>
          ) : (
            <MenuItem onClick={handleReactMessage}>React</MenuItem>
          )}
        </Menu>

        <Popover
          open={Boolean(emojiAnchorEl)}
          anchorEl={emojiAnchorEl}
          onClose={() => setEmojiAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Picker
            reactionsDefaultOpen={true}
            theme={themeMode === "dark" ? "dark" : "light"}
            emojiStyle="native"
            skinTonePickerLocation="none"
            onReactionClick={handleEmojiSelect}
            onEmojiClick={handleEmojiSelect}
            height={400}
            width={350}
          />
        </Popover>

        <Divider />

        <MessageInput
          handleSendMessage={handleSendMessage}
          themeMode={themeMode}
        />
      </Box>
    </Box>
  );
};

export default ChatView;
