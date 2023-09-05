import {
  Box,
  Button,
  Menu,
  MenuButton,
  Text,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  useDisclosure,
  Input,
  InputRightElement,
  InputGroup,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../context/ChatProvider";
import ChatLoading from "../ChatLoading";
import UserListItem from "./listItems/UserListItem";

// added test comment
const NavBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { user, setUser, setSelectedChat, chats, setChats } = ChatState();
  const history = useHistory();
  const toast = useToast();

  const logoutHandler = () => {
    window.localStorage.clear();
    setUser(null);
    setSelectedChat(null);
    setChats([]);
    history.push("/");
    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 1000,
      isClosable: false,
    });
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something in search!",
        status: "warning",
        duration: 2000,
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
      setLoading(true);
      const { data } = await axios.get(`/api/user?search=${search}`, options);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error occurred",
        description: "Failed to load the Search Results!!",
        status: "error",
        duration: 2000,
        isClosable: false,
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      const options = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoadingChat(true);
      const { data } = await axios.post("/api/chat", { userId }, options);
      setSelectedChat(data);

      if (!chats.find((c) => c._id === data._id)) {
        setChats((chats) => [...chats, data]);
      }

      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error occurred",
        description: error.message,
        status: "error",
        duration: 2000,
        isClosable: false,
      });
    }
  };

  return (
    <Box
      display="flex"
      bg="white"
      justifyContent="space-between"
      width="100%"
      borderWidth="5px"
      p="5px 10px 5px 10px"
    >
      <Button variant="ghost" onClick={onOpen}>
        <i className="fas fa-search"></i>
        <Text display={{ base: "none", md: "flex" }} px="4">
          search user
        </Text>
      </Button>
      <>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Search Users </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <InputGroup>
                <Input
                  mb="6"
                  autoComplete="off"
                  aria-autocomplete="none"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                ></Input>
                <InputRightElement>
                  <Button onClick={handleSearch} isLoading={loading}>
                    <i className="fas fa-search"></i>
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Box>
                {" "}
                {loading ? (
                  <ChatLoading />
                ) : (
                  searchResult?.map((user) => {
                    return (
                      <UserListItem
                        user={user}
                        key={user._id}
                        handleFunction={() => accessChat(user._id)}
                      />
                    );
                  })
                )}
              </Box>
              <Box float="right">
                {loadingChat ? (
                  <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="blue.500"
                    size="xl"
                  />
                ) : (
                  ""
                )}
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>

      <Text fontSize="2xl" fontFamily="Work Sans" fontWeight="bold">
        Chatterly
      </Text>
      <Box>
        <Button onClick={logoutHandler}>Logout</Button>
      </Box>
    </Box>
  );
};

export default NavBar;
