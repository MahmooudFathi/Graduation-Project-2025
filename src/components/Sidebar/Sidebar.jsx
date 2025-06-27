// Sidebar.jsx
import React, { useState } from "react";
import "./Sidebar.css";

// Fake data for contacts
const contactsData = [
  { id: 1, name: "John Doe", online: true, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" },
  { id: 2, name: "Emma Thompson", online: false, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b820?w=40&h=40&fit=crop&crop=face" },
  { id: 3, name: "Olivia Miller", online: false, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" },
  { id: 4, name: "Sophia Davis", online: false, avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40&h=40&fit=crop&crop=face" },
  { id: 5, name: "Ava Wilson", online: false, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face" },
  { id: 6, name: "Isabella Brown", online: false, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face" },
  { id: 7, name: "Mia Johnson", online: false, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop&crop=face" },
  { id: 8, name: "Charlotte Williams", online: false, avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=40&h=40&fit=crop&crop=face" }
];

const Sidebar = ({ selectedContact, onSelectContact }) => {
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  
  const filteredContacts = showOnlineOnly 
    ? contactsData.filter(contact => contact.online) 
    : contactsData;

  const onlineCount = contactsData.filter(contact => contact.online).length;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="contacts-title">
          <span className="contacts-icon">👥</span>
          <h2 className="sidebar-title">Contacts</h2>
        </div>
        
        <div className="online-filter">
          <label className="filter-checkbox">
            <input 
              type="checkbox" 
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
            />
            <span className="checkmark"></span>
            Show online only
          </label>
          <span className="online-count">({onlineCount} online)</span>
        </div>
      </div>

      <div className="contacts-list">
        {filteredContacts.map(contact => (
          <div 
            key={contact.id}
            onClick={() => onSelectContact && onSelectContact(contact)}
            className={`contact-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
          >
            <div className="contact-avatar-container">
              <img 
                src={contact.avatar} 
                alt={contact.name}
                className="contact-avatar"
              />
              {contact.online && <div className="online-indicator"></div>}
            </div>
            
            <div className="contact-info">
              <div className="contact-name">{contact.name}</div>
              <div className="contact-status">{contact.online ? 'Online' : 'Offline'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;