import { useState } from "react";
import ChatContainer from "../../components/ChatContainer/ChatContainer";
import NoChatSelected from "../../components/NoChatSelected/NoChatSelected";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./Chat.css";
import Navbar from "../../components/Navbar/Navbar";

const Chat = () => {
  const [selectedContact, setSelectedContact] = useState(null);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  return (
    <>
      <Navbar />
      <div className="chat-page">
        <Sidebar
          selectedContact={selectedContact}
          onSelectContact={handleSelectContact}
        />
        {selectedContact ? (
          <ChatContainer contact={selectedContact} />
        ) : (
          <NoChatSelected />
        )}
      </div>
    </>
  );
};

export default Chat;
