import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  Box,
  useToast,
} from "@chakra-ui/react";
import { ChatState } from "../../context/ChatProvider";
import SelectedUsersListItem from "./listItems/selectedUsersListItem";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "./listItems/UserListItem";

const GroupModal = ({ isOpen, onClose, fetchChats }) => {
  const { selectedChat, user, setSelectedChat } = ChatState();
  const [newGroupName, setNewGroupName] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSearch = async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(`/api/user`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params: {
          search: search ? search : "#%",
        },
      });

      setSearchResult(data);
      setLoading(false);
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

  const handleRemove = async (u) => {
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only Group Admin can remove someone to the group",
        status: "warning",
        duration: 1000,
        isClosable: false,
      });
      return;
    }
    const options = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      const { data } = await axios.put(
        "api/chat/groupremove",
        { chatId: selectedChat._id, userId: u._id },
        options
      );

      setSelectedChat(data);
      fetchChats();
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

  const handleRename = async () => {
    try {
      const options = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chat/rename",
        { name: newGroupName, chatId: selectedChat._id },
        options
      );

      setSelectedChat(data);
      fetchChats();
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

  const selectUser = async (u) => {
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only Group Admin can add someone to the group",
        status: "warning",
        duration: 1000,
        isClosable: false,
      });
      return;
    }

    if (
      selectedChat.users.find((ele) => {
        return ele._id === u._id;
      })
    ) {
      toast({
        title: "User is already added to the group",
        status: "warning",
        duration: 1000,
        isClosable: false,
      });
      return;
    }

    const options = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      const { data } = await axios.put(
        "/api/chat/groupadd",
        { chatId: selectedChat._id, userId: u._id },
        options
      );

      setSelectedChat(data);
      fetchChats();
    } catch (err) {
      toast({
        title: "error occurred",
        description: err.message,
        status: "warning",
        duration: 1000,
        isClosable: false,
      });
    }
  };

  const flushData = () => {
    setSearch("");
    setSearchResult([]);
    setNewGroupName("");
  };

  useEffect(() => {
    handleSearch();
  }, [search]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader> {selectedChat.chatName} </ModalHeader>
        <ModalCloseButton onClick={flushData} />
        <ModalBody></ModalBody>

        <Box display="flex" flexWrap="wrap" justifyContent="center">
          {selectedChat.users.map((u) => {
            return user._id !== u._id ? (
              <SelectedUsersListItem
                key={u._id}
                name={u.name}
                handleFunction={() => {
                  handleRemove(u);
                }}
              />
            ) : null;
          })}
        </Box>
        <Box display="flex" px="4" alignItems="center" mt="4">
          <Input
            placeholder="Enter chat Name"
            mr="2"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          ></Input>
          <Button colorScheme="teal" onClick={handleRename}>
            Update
          </Button>
        </Box>
        <Box display="flex" px="4" alignItems="center" mt="2">
          <Input
            placeholder="Add User"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          ></Input>
        </Box>
        <Box mx="4" mt="3">
          {loading ? (
            <ChatLoading />
          ) : (
            searchResult?.map((u) => {
              return (
                <UserListItem
                  user={u}
                  key={u._id}
                  handleFunction={() => selectUser(u)}
                />
              );
            })
          )}
        </Box>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GroupModal;
