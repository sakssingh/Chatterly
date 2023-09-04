import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";
import { Box, useToast } from "@chakra-ui/react";
import NavBar from "../Components/Miscellaneous/NavBar";
import MyChats from "../Components/Miscellaneous/MyChats";
import ChatBox from "../Components/Miscellaneous/ChatBox";
import { io } from "socket.io-client";

var socket;
const ENDPOINT = "http://localhost:5000";

const ChatPage = () => {
  const { user, setUser, selectedChat, setChats } = ChatState();
  const toast = useToast();

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
  }, []);

  const fetchChats = async () => {
    try {
      var options = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      let { data } = await axios.get("/api/chat", options);
      setChats(data);
    } catch (err) {
      toast({
        title: "error occurred",
        description: err.message,
        status: "error",
        duration: 2000,
        isClosable: false,
      });
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <NavBar />
      <Box
        display="flex"
        justifyContent="space-between"
        p="10px"
        width="100%"
        height="91.5vh"
      >
        {user && <MyChats fetchChats={fetchChats} />}
        {socket && <ChatBox fetchChats={fetchChats} socket={socket} />}
      </Box>
    </div>
  );
};

export default ChatPage;
