import { db } from '../../configs/firebaseConfig';
import { ref, set, push, get } from 'firebase/database';

export const createDirectChat = async (user1, user2) => {
  try {
    // Check for existing chat
    const chatRef = ref(db, 'chats');
    const snapshot = await get(chatRef);
    let chatId = null;

    if (snapshot.exists()) {
      const chats = snapshot.val();
      for (const id in chats) {
        const chat = chats[id];
        if (chat.members.includes(user1.handle) && chat.members.includes(user2.handle)) {
          chatId = id;
          break;
        }
      }
    }

    // If no existing chat, create a new one
    if (!chatId) {
      const newChatRef = push(ref(db, 'chats'));
      chatId = newChatRef.key;

      const chat = {
        members: [user1.handle, user2.handle],
        createdOn: new Date().toString(),
        uid: chatId,
      };

      await set(ref(db, `chats/${chatId}`), chat);

      const initialMessage = {
        content: 'Welcome to the chat!',
        sender: 'Admin',
        timestamp: new Date().toString(),
      };

      await set(ref(db, `messages/${chatId}/0`), initialMessage);
    }

    return chatId;
  } catch (error) {
    console.error('Error creating chat:', error.message);
    throw new Error('Error creating chat');
  }
};