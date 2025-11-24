import React, { useEffect, useRef } from 'react';
import { Box, Paper, Stack, Avatar, Typography, IconButton } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const MessageList = ({ messages, user, handleMenuClick, formatTime }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        paddingRight: 1,
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
              alignSelf: message.sender === user.handle ? 'flex-end' : 'flex-start',
              bgcolor: message.sender === user.handle ? 'primary.dark' : 'background.paper',
              color: message.sender === user.handle ? 'white' : 'white',
            }}
            elevation={8}
          >
            <Stack direction="row" spacing={2} alignItems="start">
              <Avatar src={message.senderPhoto} sx={{ width: 40, height: 40 }} />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2" color="text.secondary">
                    {message.sender || 'Unknown User'}
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
                {message.gifUrl && (
                  <img src={message.gifUrl} alt="GIF" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px' }} />
                )}
                {message.reactions && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {Object.entries(message.reactions).map(([emoji, users]) => {
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
                    })}
                  </Box>
                )}
              </Box>
            </Stack>
          </Paper>
        ))}
        <div ref={messagesEndRef} />
      </Stack>
    </Box>
  );
};

export default MessageList;