import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../configs/firebaseConfig';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { AppContext } from '../store/app.context';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
  Stack,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  Popover,
  Badge,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import Chats from './Chats';
import Picker from 'emoji-picker-react';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { ThemeContext } from '../store/theme.context';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';

const ChatView = () => {
  const { teamId, channelId } = useParams();
  const { themeMode } = useContext(ThemeContext);
  const { user, userData } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const mainChatRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageInputAnchorEl, setMessageInputAnchorEl] = useState(null);

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

  useEffect(() => {
    if (mainChatRef.current) {
      mainChatRef.current.scrollTop = mainChatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messagesRef = ref(db, `channels/${teamId}/${channelId}/messages`);
      const newMessageRef = push(messagesRef);

      await set(newMessageRef, {
        content: newMessage,
        sender: user.uid,
        timestamp: new Date().toString(),
        senderName: userData?.handle,
        senderPhoto: userData?.photo,
        edited: false,
        readBy: {
          [user.uid]: true,
        },
      });

      setNewMessage('');
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

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
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
    <Box sx={{ height: 'calc(100vh - 64px)', // Subtract header height
      overflow: 'hidden', display: 'flex' }}>
      {/* Sidebar - Chats Component */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '26.75%',
          ml: 3,
          overflowY: 'auto',
          overflowX: 'hidden',
          overflow:"height",
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

        <Box
          ref={mainChatRef}
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          <Stack spacing={2}>
            {messages.map((message) => (
              <Paper
                key={message.id}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  alignSelf:
                    message.sender === user.uid ? 'flex-end' : 'flex-start',
                  bgcolor:
                    message.sender === user.uid
                      ? 'primary.dark'
                      : 'background.paper',
                }}
                elevation={8}
              >
                <Stack direction="row" spacing={2} alignItems="start">
                  <Avatar
                    src={message.senderPhoto}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        {message.senderName || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.timestamp)}
                      </Typography>
                      {message.edited && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}
                        >
                          Edited
                        </Typography>
                      )}
                      <IconButton
                        type="button"
                        color="primary"
                        onClick={(e) => handleMenuClick(e, message)}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    </Stack>
                    <Typography variant="body1">{message.content}</Typography>
                    {message.reactions && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {Object.entries(message.reactions).map(
                          ([emoji, users]) => {
                            const count = Object.keys(users).length;
                            return count > 0 ? (
                              <Typography
                                key={emoji}
                                variant="body2"
                                sx={{
                                  bgcolor: 'rgba(0,0,0,0.1)',
                                  borderRadius: 1,
                                  px: 1,
                                  py: 0.5,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                {emoji}
                                {count > 1 && count}
                              </Typography>
                            ) : null;
                          }
                        )}
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Paper>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

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

        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <form onSubmit={handleSendMessage}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <IconButton
                type="button"
                color="primary"
                onClick={(e) => {
                  setMessageInputAnchorEl(e.currentTarget);
                  setShowEmojiPicker(!showEmojiPicker);
                }}
              >
                <EmojiEmotionsIcon />
              </IconButton>
              <IconButton
                type="submit"
                color="primary"
                disabled={!newMessage.trim()}
              >
                <SendIcon />
              </IconButton>
            </Stack>
          </form>
          <Popover
            open={showEmojiPicker}
            anchorEl={messageInputAnchorEl}
            onClose={() => setShowEmojiPicker(false)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
            <Picker
              theme={themeMode === 'dark' ? 'dark' : 'light'}
              emojiStyle="native"
              onEmojiClick={onEmojiClick}
              height={400}
              width={350}
            />
          </Popover>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatView;
