import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { io } from "socket.io-client";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const [socket, setSocket] = useState(null);

  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    if (!userInfo) history.push("/");

    // Initialize socket connection
    const newSocket = io("https://mern-chat-backend-02t3.onrender.com"); // replace with your backend URL
    setSocket(newSocket);

    if (userInfo) {
      newSocket.emit("setup", userInfo);
      newSocket.on("connected", () => console.log("Socket connected"));
    }

    // Listen for incoming messages
    newSocket.on("message received", (message) => {
      // If the message is not in the current chat, add to notifications
      if (!selectedChat || selectedChat._id !== message.chat._id) {
        setNotification((prev) => [message, ...prev]);
      } else {
        // If in current chat, append to messages state
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === message.chat._id
              ? { ...chat, messages: [...chat.messages, message] }
              : chat
          )
        );
      }
    });

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        socket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
