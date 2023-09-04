import {
  Box,
  Button,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import axios from "axios";
import MessageItem from "./listItems/MessageItem";
import GroupModal from "./GroupModal";
import { ArrowForwardIcon } from "@chakra-ui/icons";

const ChatBox = ({ fetchChats, socket }) => {
  const { selectedChat, user } = ChatState();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState([]);
  const [sending, setSending] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  const sendContent = async () => {
    if (!content) return;
    setSending(true);

    const options = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      const { data } = await axios.post(
        "/api/message/",
        { chatId: selectedChat._id, text: content },
        options
      );
      socket.emit("send message", data);
      setMessages([data, ...messages]);
      setContent("");
      setSending(false);
      fetchChats();
    } catch (err) {
      toast({
        title: "error occurred",
        description: err.response.data.message,
        status: "error",
        duration: 2000,
        isClosable: false,
      });
    }
  };

  const loadMessages = async () => {
    const options = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        options
      );

      data.reverse();
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (err) {
      toast({
        title: "error occurred",
        description: err,
        status: "error",
        duration: 2000,
        isClosable: false,
      });
    }
  };

  useEffect(() => {
    if (selectedChat) {
      if (selectedChat._id !== selectedChatId) {
        setSelectedChatId(selectedChat._id);
        setMessages([]);
        loadMessages();
      }
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on("receive message", (newMessage) => {
      if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
        fetchChats();
        return;
      }
      setMessages([newMessage, ...messages]);
      fetchChats();
    });
    return () => socket.off("receive message");
  });

  return (
    <Box backgroundColor="white" width="71.5%">
      {!selectedChat ? (
        <Box textAlign="center" position="absolute" left="60%" top="50%">
          <h1>CHATTERLY</h1>
          <h4>Click on a chat to open here</h4>
        </Box>
      ) : (
        <React.Fragment>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text fontSize="3xl" ml="40%">
              {selectedChat.chatName}
            </Text>
            {selectedChat.isGroupChat ? (
              <Box mr="2">
                <Button onClick={onOpen}>Group Options</Button>
                <GroupModal
                  isOpen={isOpen}
                  onClose={onClose}
                  fetchChats={fetchChats}
                />
              </Box>
            ) : null}
          </Box>
          <Box
            backgroundColor="#efeae2"
            h="80vh"
            borderRadius="lg"
            mx="2"
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
          >
            <Box
              overflow="auto"
              display="flex"
              flexDirection="column-reverse"
              css={{
                "&::-webkit-scrollbar": {
                  width: "1px",
                },
                "&::-webkit-scrollbar-track": {
                  width: "1px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "grey",
                  borderRadius: "24px",
                },
              }}
            >
              {messages?.map((message) => {
                return <MessageItem key={message._id} message={message} />;
              })}
            </Box>
            <Box mb="2" display="flex" alignItems="center">
              <Textarea
                borderRadius="md"
                rows="1"
                resize="none"
                overflowY="hidden"
                mx="2"
                backgroundColor="#d8d4cd"
                placeholder="Type some Message to send"
                size="sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Box
                backgroundColor="#52c8c4"
                mr="2"
                borderRadius="md"
                onClick={sendContent}
                _hover={{ backgroundColor: "#42a09d" }}
                cursor="pointer"
              >
                {sending ? (
                  <Button
                    isLoading
                    colorScheme="teal"
                    variant="solid"
                    boxSize="7"
                  >
                    {" "}
                  </Button>
                ) : (
                  <ArrowForwardIcon boxSize="8" color="white" />
                )}
              </Box>
            </Box>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
};

export default ChatBox;
