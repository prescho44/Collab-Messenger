import React from 'react';
import { useParams } from 'react-router-dom';

const DirectChat = () => {
  const { chatId } = useParams();

  return (
    <div>
      <h1>Direct Chat ID: {chatId}</h1>
      {/* Implement direct chat UI here */}
    </div>
  );
};

export default DirectChat;