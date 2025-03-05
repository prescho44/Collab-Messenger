import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from "../configs/firebaseConfig";
import { ref, onValue, push, set } from 'firebase/database';
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
  List,
  ListItem,
  ListItemText,
  Drawer
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatView = () => {
  const { teamId, channelId } = useParams();
  const { user, userData} = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!teamId || !channelId) return;

    const messagesRef = ref(db, `channels/${teamId}/${channelId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesList = Object.entries(messagesData).map(([id, message]) => ({
          id,
          ...message,
          timestamp: new Date(message.timestamp)
        }));
        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [teamId, channelId]);

  useEffect(() => {
    const postsRef = ref(db, "teams");
    onValue(postsRef, (snapshot) => {
      const postsData = snapshot.val();
      if (postsData) {
        const teamsList = Object.entries(postsData).map(([id, team]) => ({
          id,
          teamName: team.teamName || "Unnamed Team",
          channels: team.channels ? Object.keys(team.channels) : [],
        }));
        setTeams(teamsList);
      } else {
        setTeams([]);
      }
    });
  }, []);

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
        edited: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        <List>
          {teams.map((team) => (
            <div key={team.id}>
              <ListItem>
                <ListItemText primary={team.teamName} />
              </ListItem>
              {team.channels.map((channelId) => (
                <ListItem
                  button
                  key={channelId}
                  onClick={() => navigate(`/teams/${team.id}/${channelId}`)}
                >
                  <ListItemText primary={channelId} />
                </ListItem>
              ))}
            </div>
          ))}
        </List>
      </Drawer>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Messages Container */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'background.default' }}>
          <Stack spacing={2}>
            {messages.map((message) => (
              <Paper
                key={message.id}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  alignSelf: message.sender === user.uid ? 'flex-end' : 'flex-start',
                  bgcolor: message.sender === user.uid ? 'primary.dark' : 'background.paper'
                }}
              >
                <Stack direction="row" spacing={2} alignItems="start">
                  <Avatar src={message.senderPhoto} sx={{ width: 40, height: 40 }} />
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2" color="text.secondary">
                        {message.senderName || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Stack>
                    <Typography variant="body1">
                      {message.content}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        <Divider />

        {/* Message Input */}
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <form onSubmit={handleSendMessage}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'primary.main' },
                    '&:hover fieldset': { borderColor: 'primary.light' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  }
                }}
              />
              <IconButton type="submit" color="primary" disabled={!newMessage.trim()}>
                <SendIcon />
              </IconButton>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatView;