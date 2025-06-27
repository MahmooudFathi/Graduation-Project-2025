// ChatHeader.jsx
import React from "react";
import "./ChatHeader.css";

const ChatHeader = ({ contact }) => {
  // Default contact if none selected (for testing)
  const defaultContact = {
    name: "John Doe",
    online: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
  };

  const currentContact = contact || defaultContact;

  return (
    <div className="chat-header">
      <div className="chat-header-user">
        <div className="chat-avatar-container">
          <img
            src={currentContact.avatar}
            alt={currentContact.name}
            className="chat-header-avatar"
          />
          {currentContact.online && <div className="chat-online-indicator"></div>}
        </div>
        <div className="chat-user-info">
          <h3 className="chat-header-name">{currentContact.name}</h3>
          <p className="chat-header-status">
            {currentContact.online ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      <div className="chat-header-actions">
        <button className="chat-action-btn" title="Search">
          🔍
        </button>
        <button className="chat-action-btn" title="More options">
          ⋮
        </button>
        <button className="chat-close-btn" title="Close chat">
          ✕
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;