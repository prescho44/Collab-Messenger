import { db } from '../../configs/firebaseConfig';
import { ref, set, push } from 'firebase/database';

export const createDirectChat = async (currentUserData, userData) => {
  try {
    const newChatRef = push(ref(db, 'chats'));
    const chatId = newChatRef.key;

    const chat = {
      chatName: `${currentUserData.username} & ${userData.username}`,
      members: [currentUserData.handle, userData.handle],
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


    await set(ref(db, `users/${currentUserData.handle}/channels/${chatId}`), chat);
    await set(ref(db, `users/${userData.handle}/channels/${chatId}`), chat);

    return chatId;
  } catch (error) {
    console.error('Error creating chat:', error.message);
    throw new Error('Error creating chat');
  }
};