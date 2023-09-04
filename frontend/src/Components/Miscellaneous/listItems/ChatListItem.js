import { Avatar, Box, Image, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ChatState } from "../../../context/ChatProvider";

const ChatListItem = ({ chat, handleFunction }) => {
  const { user, selectedChat, chats } = ChatState();
  const [chatTitle, setChatTitle] = useState(null);
  const [chatListPic, setChatListPic] = useState(null);

  const findChatData = () => {
    if (chat.isGroupChat) {
      setChatTitle(chat.chatName);
      return;
    }

    chat.users.forEach((u) => {
      if (u._id !== user._id) {
        setChatTitle(u.name);
        setChatListPic(u.pic);
      }
    });
  };

  useEffect(() => {
    findChatData();
  }, [chats]);

  return (
    <Box
      onClick={handleFunction}
      display="flex"
      bg={
        selectedChat
          ? selectedChat._id === chat._id
            ? "#bdbdbd"
            : "#ececec"
          : "#ececec"
      }
      _hover={{
        background: "#bdbdbd",
      }}
      width="100%"
      cursor="pointer"
      mb="1"
      alignItems="center"
      py={2}
      px={3}
    >
      <Avatar src={chatListPic} showBorder="true"></Avatar>
      <Box pl={2}>
        <Text>{chatTitle}</Text>
        <Text fontSize="sm" color="grey">
          {chat.latestMessage ? chat.latestMessage.content : null}
        </Text>
      </Box>
    </Box>
  );
};

export default ChatListItem;
