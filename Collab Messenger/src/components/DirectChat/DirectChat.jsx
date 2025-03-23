import React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext, useRef } from 'react';  
import { ref, onValue, off, push, update } from 'firebase/database';
import { db } from '../../configs/firebaseConfig';
import { AppContext } from '../../store/app.context';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText, Avatar } from '@mui/material';
import { CircularProgress } from '@mui/material';

const DirectChat = () => {
  const { chatId } = useParams();
  const {userData} = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log('DirectChat component mounted');
    console.log('Setting up messages listener for chatId:', chatId);
    const messagesRef = ref(db, `messages/${chatId}`);
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
        console.log('Fetched messages:', messagesList);
        setMessages(messagesList);
      }else{
        console.log('No messages found');
        setMessages([]);
      }
      setLoading(false);
      console.log('Loading state set to false');
    }, (error) => {
      console.error('Error fetching messages:', error.message);
      setLoading(false);
      console.log('Loading state set to false due to error');
    });

    return () => {
      console.log('Cleaning up messages listener for chatId:', chatId);
      off(messagesRef, listener);
    };
  }, [chatId]);

useEffect(() => {
  console.log('Messages updated, scrolling to bottom');
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [chatId]);


const handleSendMessage = async () => {
  if (newMessage.trim() === '') return;

  try {
    console.log('Sending message:', newMessage);
    const messageRef = push(ref(db, `messages/${chatId}`));
    const message = {
      content: newMessage,
      sender: userData.handle,
      timestamp: new Date().toISOString(),
    };

    await update(messageRef, message);
    console.log('Message sent:', message);
    setNewMessage('');
  } catch (error) {
    console.error('Error sending message:', error.message);
  }
};

  return (
    <Paper elevation={4} sx={{ maxwidth: 600, mx: 'auto', p: 4, mt: 5, borderRadius: 3 }}>
      <Typography variant="h4" gutterBottom>
        Direct Chat
      </Typography>
      {console.log('Rendering component with loading state:', loading)}
      {loading ? (
        <>
        <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
        {console.log('Loading state is true, showing CircularProgress')}
        </>
      ) : (
        <>
      <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
        <List>
          {messages.map((msg) => (
            <ListItem key={msg.id} alignItems="flex-start">
              <Avatar alt={msg.sender} src="/default-avatar.jpg" sx={{ mr: 2 }} />
              <ListItemText
                primary={<strong>{msg.sender}</strong>}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="textPrimary">
                      {msg.content}
                    </Typography>
                    <Typography component="span" variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" type="submit">
          Send
        </Button>
      </Box>
      </>
      )}
    </Paper>
  );
};

export default DirectChat;