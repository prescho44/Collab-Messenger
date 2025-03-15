import { db } from '../../configs/firebaseConfig';
import { ref, set, push, get } from 'firebase/database';

export const createDirectChat = async (currentUserData, userData) => {
  try {
    console.log('Checking for existing chat...');
    const chatRef = ref(db, 'chats');
    const snapshot = await get(chatRef);
    let chatId = null;

    if (snapshot.exists()) {
      const chats = snapshot.val();
      for (const id in chats) {
        const chat = chats[id];
        if (chat.members.includes(currentUserData.handle) && chat.members.includes(userData.handle)) {
          chatId = id;
          break;
        }
      }
    }

    if (!chatId) {
      console.log('Creating new chat...');
      const newChatRef = push(ref(db, 'chats'));
      chatId = newChatRef.key;

      const chat = {
        chatName: `${currentUserData.username} & ${userData.username}`,
        members: [currentUserData.handle, userData.handle],
        createdOn: new Date().toString(),
        uid: chatId,
      };

      console.log('Setting chat data in database...');
      await set(ref(db, `chats/${chatId}`), chat);

      const initialMessage = {
        content: 'Welcome to the chat!',
        sender: 'Admin',
        timestamp: new Date().toString(),
      };

      console.log('Setting initial message in database...');
      await set(ref(db, `messages/${chatId}/0`), initialMessage);

      console.log('Adding chat to current user channels...');
      await set(ref(db, `users/${currentUserData.handle}/channels/${chatId}`), chat);

      console.log('Adding chat to other user channels...');
      await set(ref(db, `users/${userData.handle}/channels/${chatId}`), chat);

      console.log('Chat created successfully with ID:', chatId);
    } else {
      console.log('Existing chat found with ID:', chatId);
    }

    return chatId;
  } catch (error) {
    console.error('Error creating or fetching chat:', error.message);
    throw new Error('Error creating or fetching chat');
  }
};