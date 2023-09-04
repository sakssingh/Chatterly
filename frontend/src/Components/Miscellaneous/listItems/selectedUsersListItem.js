import { Box, Text } from "@chakra-ui/react";
import { SmallCloseIcon } from "@chakra-ui/icons";
import React from "react";

const SelectedUsersListItem = ({ name, handleFunction }) => {
  return (
    <Box
      backgroundColor="cyan"
      mx="1"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      borderRadius="md"
    >
      <Text ml="1">{name}</Text>
      <SmallCloseIcon onClick={handleFunction} _hover={{ cursor: "pointer" }} />
    </Box>
  );
};

export default SelectedUsersListItem;
