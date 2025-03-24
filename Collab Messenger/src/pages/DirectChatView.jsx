import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { ref, onValue, push, set, off } from "firebase/database";
import { db } from "../configs/firebaseConfig";
import { AppContext } from "../store/app.context";
import { Box, CircularProgress, Typography } from "@mui/material";
import Chats from "./Chats";
import MessageInput from "../components/Messages/MessageInput";
import MessageList from "../components/MessageList";

const DirectChatView = () => {
  const { chatId } = useParams();
  const { userData } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    return () => {
      off(messagesRef, listener);
    };
  }, [chatId]);

  const handleSendMessage = async (content, gifUrl, type) => {
    if (!content.trim() && !gifUrl) return;

    try {
      const messageRef = push(ref(db, `messages/${chatId}`));
      const message = {
        content,
        gifUrl,
        type,
        sender: userData.handle,
        timestamp: new Date().toISOString(),
      };

      await set(messageRef, message);
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)", // Subtract header height
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
        }}
      >
        <Chats />
      </Box>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box
          elevation={3}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            p: 2,
            borderRadius: 2,
            bgcolor: "background.paper",
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Direct Chat
          </Typography>

          {loading ? (
            <CircularProgress sx={{ alignSelf: "center" }} />
          ) : (
            <>
              <MessageList
                messages={messages}
                user={userData}
                handleMenuClick={() => {}}
                formatTime={(timestamp) => new Date(timestamp).toLocaleString()}
              />
              <MessageInput handleSendMessage={handleSendMessage} themeMode="inherit" />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DirectChatView;