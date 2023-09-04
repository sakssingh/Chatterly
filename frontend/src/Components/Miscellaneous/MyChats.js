import React, { useEffect, useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import {
  Box,
  Button,
  Input,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import ChatListItem from "./listItems/ChatListItem";
import UserListItem from "./listItems/UserListItem";
import ChatLoading from "../ChatLoading";
import SelectedUsersListItem from "./listItems/selectedUsersListItem";

const MyChats = ({ fetchChats }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setSelectedChat, selectedChat, chats, setChats, user } = ChatState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSearch = async () => {
    setLoading(true);

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
  };

  const selectUser = (user) => {
    if (!selectedUsers.includes(user)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const unselectUser = (user) => {
    var array = [...selectedUsers];
    var index = array.indexOf(user);
    if (index !== -1) {
      array.splice(index, 1);
      setSelectedUsers(array);
    }
  };

  const accessChat = async (chatId) => {
    if (selectedChat && selectedChat._id === chatId) return;

    const data = chats.filter((chat) => {
      return chat._id === chatId;
    });
    setSelectedChat(data[0]);
  };

  const createGroupChat = async () => {
    try {
      const options = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/chat/creategroup",
        {
          users: selectedUsers.map((u) => {
            return u._id;
          }),
          name: groupName,
        },
        options
      );

      setChats([data, ...chats]);
      onClose();
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

  const flushData = () => {
    setSearch("");
    setSearchResult([]);
    setGroupName("");
    setSelectedUsers([]);
  };

  useEffect(() => {
    handleSearch();
  }, [search]);

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <Box width="28%" backgroundColor="white">
      <Box
        display="flex"
        justifyContent="space-between"
        alignContent="center"
        alignItems="center"
        mb="2"
        mt="2"
        padding="1"
      >
        <Text as="b" fontSize="xl" ml="2vw">
          {" "}
          My Chats{" "}
        </Text>
        <Button onClick={onOpen}> Create New Group + </Button>
        <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader> Create Group Chat </ModalHeader>
            <ModalCloseButton onClick={flushData} />
            <ModalBody>
              <Stack>
                <Input
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                ></Input>
                <Input
                  placeholder="Search by name or email"
                  autoComplete="off"
                  list="autocompleteOff"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                ></Input>
                <Box display="flex" flexWrap="wrap">
                  {selectedUsers?.map((u) => {
                    return (
                      <SelectedUsersListItem
                        key={u._id}
                        name={u.name}
                        handleFunction={() => unselectUser(u)}
                      />
                    );
                  })}
                </Box>
                <Box>
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
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" onClick={() => createGroupChat()}>
                Create Group
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
      <Box overflowY="hidden">
        {chats?.map((chat) => {
          return (
            <ChatListItem
              chat={chat}
              key={chat._id}
              handleFunction={() => accessChat(chat._id)}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default MyChats;
