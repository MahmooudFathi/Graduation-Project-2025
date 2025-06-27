// ChatContainer.jsx
import React, { useState } from "react";
import ChatHeader from "../ChatHeader/ChatHeader";
import MessageInput from "../MessageInput/MessageInput";
import "./ChatContainer.css";

// Fake messages data
const initialMessages = [
  { id: 1, text: "How's it going?!", sender: "other", time: "01:26", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
  { id: 2, text: "Not bad!", sender: "other", time: "01:26", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
  { id: 3, text: "Working on React.js!", sender: "other", time: "01:26", isReactIcon: true, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" },
  { id: 4, text: "Doing great wbu?!", sender: "me", time: "01:26" }
];

const MessageBubble = ({ message, isMe }) => {
  return (
    <div className={`message-wrapper ${isMe ? 'message-me' : 'message-other'}`}>
      {!isMe && (
        <img 
          src={message.avatar} 
          alt="Avatar" 
          className="message-avatar"
        />
      )}
      
      <div className={`message-bubble ${isMe ? 'bubble-me' : 'bubble-other'}`}>
        {message.isReactIcon ? (
          <div className="react-message">
            <div className="react-icon">⚛️</div>
            <div className="react-text">{message.text}</div>
          </div>
        ) : (
          <div className="message-text">{message.text}</div>
        )}
        <div className="message-time">{message.time}</div>
      </div>
    </div>
  );
};

const ChatContainer = ({ contact }) => {
  const [messages, setMessages] = useState(initialMessages);
  
  const addMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text: text,
      sender: "me",
      time: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="chat-container">
      <ChatHeader contact={contact} />
      
      <div className="messages-area">
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message} 
            isMe={message.sender === 'me'} 
          />
        ))}
      </div>
      
      <MessageInput onSendMessage={addMessage} />
    </div>
  );
};

export default ChatContainer;