import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../configs/firebaseConfig';
import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
  get,
} from 'firebase/database';
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
  Badge,
  Button,
  Modal,
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import Chats from './Chats';
import Picker from 'emoji-picker-react';
import { ThemeContext } from '../store/theme.context';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import GifBoxIcon from '@mui/icons-material/GifBox';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';

const ChatView = () => {
  const { teamId, channelId } = useParams();
  const { themeMode } = useContext(ThemeContext);
  const { user, userData } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageInputAnchorEl, setMessageInputAnchorEl] = useState(null);
  const [showGiphyModal, setShowGiphyModal] = useState(false);
  const [giphySearchTerm, setGiphySearchTerm] = useState('');
  const gf = new GiphyFetch('VzWDxyDf7RblAUpx7HSYDSD3D6dn1SzZ'); // Replace with your Giphy API key

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

  const handleSendGif = async (gifUrl) => {
    try {
      const messagesRef = ref(db, `channels/${teamId}/${channelId}/messages`);
      const newMessageRef = push(messagesRef);

      await set(newMessageRef, {
        content: gifUrl,
        sender: user.uid,
        timestamp: new Date().toString(),
        senderName: userData?.handle,
        senderPhoto: userData?.photo,
        edited: false,
        readBy: {
          [user.uid]: true,
        },
        isGif: true,
      });

      setShowGiphyModal(false);
    } catch (error) {
      console.error('Error sending GIF:', error);
    }
  };

  const handleLeaveTeam = async () => {
    const userConfirmed = window.confirm(
      'Are you sure you want to leave this team? This will remove you from the team and all its channels.'
    );

    if (!userConfirmed) return;

    try {
      // Remove the user from the team's members
      const teamMembersRef = ref(db, `teams/${teamId}/members`);
      const snapshot = await get(teamMembersRef);

      if (snapshot.exists()) {
        const members = snapshot.val();
        if (Array.isArray(members)) {
          const updatedMembers = members.filter(
            (member) => member !== userData?.handle
          );
          await set(teamMembersRef, updatedMembers);
        }
      }

      // Remove the user from all channels in the team
      const channelsRef = ref(db, `channels/${teamId}`);
      const channelsSnapshot = await get(channelsRef);

      if (channelsSnapshot.exists()) {
        const channels = channelsSnapshot.val();
        for (const channelId in channels) {
          const participantsRef = ref(
            db,
            `channels/${teamId}/${channelId}/participants`
          );
          const participantsSnapshot = await get(participantsRef);

          if (participantsSnapshot.exists()) {
            const participants = participantsSnapshot.val();
            const updatedParticipants = participants.filter(
              (participant) => participant !== userData?.handle
            );
            await set(participantsRef, updatedParticipants);
          }
        }
      }

      // Navigate back to the main page
      navigate('/');
    } catch (error) {
      console.error('Error leaving team:', error);
    }
  };

  const handleLeaveChannel = async () => {
    const userConfirmed = window.confirm(
      'Are you sure you want to leave this channel?'
    );

    if (!userConfirmed) return;

    try {
      const participantsRef = ref(
        db,
        `channels/${teamId}/${channelId}/participants`
      );
      const snapshot = await get(participantsRef);

      if (snapshot.exists()) {
        const participants = participants.val();
        const updatedParticipants = participants.filter(
          (participant) => participant !== userData?.handle
        );
        await set(participantsRef, updatedParticipants);
      }

      navigate('/');
    } catch (error) {
      console.error('Error leaving channel:', error);
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

  const renderGifGrid = () => (
    <Grid
      key={giphySearchTerm} // Add key to re-render the grid when the search term changes
      width={310}
      columns={2}
      hideAttribution={true}
      fetchGifs={async (offset) => {
        try {
          return giphySearchTerm
            ? await gf.search(giphySearchTerm, { offset, limit: 9 })
            : await gf.trending({ offset, limit: 9 });
        } catch (error) {
          console.error('Error fetching GIFs:', error);
          return { data: [] };
        }
      }}
      onGifClick={(gif, e) => {
        e.preventDefault();
        handleSendGif(gif.images.original.url);
      }}
    />
  );

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
        height: 'calc(100vh - 64px)', // Subtract header height
        overflow: 'hidden',
        display: 'flex',
      }}
    >
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
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h6">{channelId}</Typography>
          </Box>
          <IconButton
            sx={{ marginInline: 1 }}
            color="primary"
            onClick={() => navigate('/video-call')}
          >
            <VideoCallIcon />
          </IconButton>
          <Stack direction="row" spacing={2}>
            <Button
              color="error"
              variant="outlined"
              onClick={handleLeaveChannel}
            >
              Leave Channel
            </Button>
            <Button color="error" variant="contained" onClick={handleLeaveTeam}>
              Leave Team
            </Button>
          </Stack>
        </Box>

        <Box
          ref={mainChatRef}
          sx={{
            flex: 1,
            overflowY: 'auto', // Enable vertical scrolling
            paddingRight: 1, // Add some padding for the scrollbar
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'background.paper',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.main',
              borderRadius: '4px',
            },
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
                    {message.isGif ? (
                      <img
                        src={message.content}
                        alt="GIF"
                        style={{ maxWidth: '100%' }}
                      />
                    ) : (
                      <Typography variant="body1">{message.content}</Typography>
                    )}
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

        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <form onSubmit={handleSendMessage}>
            <Stack direction="row" spacing={1}>
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
                <EmojiEmotionsIcon sx={{ fontSize: 32 }} />{' '}
              </IconButton>
              <IconButton
                type="button"
                color="primary"
                onClick={() => setShowGiphyModal(true)}
              >
                <GifBoxIcon sx={{ fontSize: 32 }} />
              </IconButton>
              <IconButton
                type="submit"
                color="primary"
                disabled={!newMessage.trim()}
              >
                <SendIcon sx={{ fontSize: 32 }} />
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
          <Modal
            open={showGiphyModal}
            onClose={() => setShowGiphyModal(false)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 2,
                width: 350,
                maxHeight: 400,
                overflowY: 'auto',
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search GIFs..."
                value={giphySearchTerm}
                onChange={(e) => setGiphySearchTerm(e.target.value)}
                sx={{ mb: 2 }}
              />
              {renderGifGrid()}
            </Box>
          </Modal>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatView;
