import React from "react";
import { ChatState } from "../../../context/ChatProvider";
import { Box, Text } from "@chakra-ui/react";

const MessageItem = ({ message }) => {
  const { user } = ChatState();
  return (
    <Box align={message.sender._id === user._id ? "right" : "left"}>
      <Box
        borderRadius="lg"
        mx="2"
        my="2"
        display="inline-block"
        maxWidth="65%"
        backgroundColor={message.sender._id === user._id ? "#e0fcd4" : "white"}
      >
        {message.sender._id !== user._id ? (
          <Text fontSize="0.70rem" ml="2" mr="2" color="grey">
            {message.sender.name}
          </Text>
        ) : null}
        <Text ml="2" mr="2" textAlign="left">
          {message.content}
        </Text>
      </Box>
    </Box>
  );
};

export default MessageItem;
