// MessageInput.jsx
import React, { useState } from "react";
import "./MessageInput.css";

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");

  const sendMessage = () => {
    if (text.trim() === "") return;
    
    if (onSendMessage) {
      onSendMessage(text);
    }
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiClick = () => {
    setText(prev => prev + "😊");
  };

  const handleAttachClick = () => {
    // Placeholder for file attachment
    console.log("Attach file clicked");
  };

  return (
    <div className="message-input-container">
      <div className="input-wrapper">
        <button 
          className="input-action-btn attach-btn" 
          onClick={handleAttachClick}
          title="Attach file"
        >
          📎
        </button>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="message-input"
          rows="1"
        />
        
        <button 
          className="input-action-btn emoji-btn" 
          onClick={handleEmojiClick}
          title="Add emoji"
        >
          😊
        </button>
        
        <button 
          onClick={sendMessage} 
          className={`message-send-button ${text.trim() ? 'active' : ''}`}
          disabled={!text.trim()}
          title="Send message"
        >
          <span className="send-icon">📤</span>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;