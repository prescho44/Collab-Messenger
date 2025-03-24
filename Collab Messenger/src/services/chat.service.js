import { db } from '../configs/firebaseConfig';
import { ref, set, push } from 'firebase/database';

export const createDirectChat = async (user1, user2) => {
  try {
    const newChatRef = push(ref(db, 'chats'));
    const chatId = newChatRef.key;

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

    return chatId;
  } catch (error) {
    console.error('Error creating chat:', error.message);
    throw new Error('Error creating chat');
  }
};