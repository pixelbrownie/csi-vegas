import React from 'react';
import ChatMessages from "https://framer.com/m/ChatMessages-1bcE.js@KpqnWmn0YnvLZZwrStGc";

const ChatRoom = () => {
    // You can now use <ChatMessages /> just like any other React component!
    return (
        <div className="chat-container">
            <ChatMessages 
                messages={[
                    { text: "Where were you at 3 AM?", sender: "user" },
                    { text: "I was at the Bellagio poker table.", sender: "witness" }
                ]}
            />
        </div>
    );
};

export default ChatRoom;