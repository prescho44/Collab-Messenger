import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../configs/firebaseConfig';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { AppContext } from '../store/app.context';
import {
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  Popover,
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import Chats from './Chats';
import Picker from 'emoji-picker-react';
import { ThemeContext } from '../store/theme.context';
import MessageList from '../components/Messages/MessageList';
import MessageInput from '../components/Messages/MessageInput';

const ChatView = () => {
  const { teamId, channelId } = useParams();
  const { themeMode } = useContext(ThemeContext);
  const { user, userData } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!teamId || !channelId) return;

    const messagesRef = ref(db, `channels/${teamId}/${channelId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
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
            const messageRef = ref(db, `channels/${teamId}/${channelId}/messages/${message.id}`);
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

    return () => unsubscribe();
  }, [teamId, channelId, user.uid]);

  const handleSendMessage = async (newMessage, fileUrl = null, messageType = 'text') => {
    if (!newMessage.trim() && !fileUrl) return;

    try {
      const messagesRef = ref(db, `channels/${teamId}/${channelId}/messages`);
      const newMessageRef = push(messagesRef);

      await set(newMessageRef, {
        content: messageType === 'text' ? newMessage : '',
        gifUrl: messageType === 'gif' ? fileUrl : null,
        fileUrl: messageType === 'file' ? fileUrl : null,
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
      console.error('Error sending message:', error);
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

    const newContent = prompt('Edit your message:', selectedMessage.content);
    if (newContent === null || newContent.trim() === '') return;

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
      console.error('Error editing message:', error);
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
      console.error('Error deleting message:', error);
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
        // Remove reaction if user already reacted with this emoji
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
        // Add new reaction
        if (existingReaction) {
          // Remove previous reaction
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
      console.error('Error updating reaction:', error);
    }

    setEmojiAnchorEl(null);
    handleMenuClose();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
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
    <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden', display: 'flex' }}>
      {/* Sidebar - Chats Component */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '26.75%',
          ml: 3,
          overflowY: 'auto',
          overflowX: 'hidden',
          overflow: 'height',
        }}
      >
        <Chats />
      </Box>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h6">{channelId}</Typography>
          </Box>
          <IconButton color="primary" onClick={() => navigate('/video-call')}>
            <VideoCallIcon />
          </IconButton>
        </Box>

        <MessageList
          messages={messages}
          user={user}
          handleMenuClick={handleMenuClick}
          formatTime={formatTime}
        />

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          {selectedMessage?.sender === user.uid ? (
            [
              <MenuItem key="edit" onClick={handleEditMessage}>Edit</MenuItem>,
              <MenuItem key="delete" onClick={handleDeleteMessage}>Delete</MenuItem>
            ]
          ) : (
            <MenuItem key="react" onClick={handleReactMessage}>React</MenuItem>
          )}
        </Menu>

        <Popover
          open={Boolean(emojiAnchorEl)}
          anchorEl={emojiAnchorEl}
          onClose={() => setEmojiAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Picker
            reactionsDefaultOpen={true}
            theme={themeMode === 'dark' ? 'dark' : 'light'}
            emojiStyle="native"
            skinTonePickerLocation="none"
            onReactionClick={handleEmojiSelect}
            onEmojiClick={handleEmojiSelect}
            height={400}
            width={350}
          />
        </Popover>

        <Divider />

        <MessageInput handleSendMessage={handleSendMessage} themeMode={themeMode} />
      </Box>
    </Box>
  );
};

export default ChatView;
