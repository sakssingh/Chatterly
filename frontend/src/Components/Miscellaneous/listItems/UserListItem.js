import { Avatar, Box, Image, Text } from "@chakra-ui/react";
import React from "react";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      display="flex"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      width="100%"
      borderRadius="2xl"
      cursor="pointer"
      mb="2"
      alignItems="center"
      py={2}
      px={3}
    >
      <Avatar src={user.pic} showBorder="true"></Avatar>
      <Box pl={2}>
        <Text>{user.name}</Text>
        <Text fontSize="14">{`email: ${user.email}`}</Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
