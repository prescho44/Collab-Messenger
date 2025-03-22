import React, { useState } from 'react';
import { Box, TextField, IconButton, Popover, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import Picker from 'emoji-picker-react';
import GifBoxIcon from '@mui/icons-material/GifBox';

const gf = new GiphyFetch('xGgAUZiSEEv1Ov0kFgficAOon2TjOCzw');

const MessageInput = ({ handleSendMessage, themeMode }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageInputAnchorEl, setMessageInputAnchorEl] = useState(null);
  const [showGiphyPicker, setShowGiphyPicker] = useState(false);
  const [giphyAnchorEl, setGiphyAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const fetchGifs = async (offset) => {
    try {
      if (searchQuery.trim()) {
        return await gf.search(searchQuery, { offset, limit: 10 });
      } else {
        return await gf.trending({ offset, limit: 10 });
      }
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      return { data: [] };
    }
  };

  const handleGifSelect = (gif) => {
    handleSendMessage('', gif.images.original.url, 'gif');
    setShowGiphyPicker(false);
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(newMessage, null, 'text');
          setNewMessage('');
        }}
      >
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
            type="button"
            color="primary"
            onClick={(e) => {
              setGiphyAnchorEl(e.currentTarget);
              setShowGiphyPicker(!showGiphyPicker);
            }}
          >
            <GifBoxIcon alt="Giphy" style={{ width: 24, height: 24 }} />
          </IconButton>
          <IconButton type="submit" color="primary" disabled={!newMessage.trim()}>
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
      <Popover
        open={showGiphyPicker}
        anchorEl={giphyAnchorEl}
        onClose={() => setShowGiphyPicker(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Box sx={{ width: 400, height: 400 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search GIFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Grid
            key={searchQuery}
            fetchGifs={fetchGifs}
            width={400}
            columns={3}
            gutter={6}
            onGifClick={(gif, e) => {
              e.preventDefault();
              handleGifSelect(gif);
            }}
          />
        </Box>
      </Popover>
    </Box>
  );
};

export default MessageInput;