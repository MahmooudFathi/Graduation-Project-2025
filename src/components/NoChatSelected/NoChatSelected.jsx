// NoChatSelected.jsx
import React from "react";
import "./NoChatSelected.css";

const NoChatSelected = () => {
  return (
    <div className="no-chat">
      <div className="no-chat-content">
        <div className="chat-icon">💬</div>
        <h2 className="welcome-title">Welcome to Chat CiTiO!</h2>
        <p className="welcome-subtitle">Select a conversation from the sidebar to start chatting</p>
        
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">👥</span>
            <span>Connect with friends</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💨</span>
            <span>Fast messaging</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <span>Secure conversations</span>
          </div>
        </div>
        
        <div className="start-hint">
          <p>👈 Choose a contact to get started</p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;