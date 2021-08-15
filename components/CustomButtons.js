import React from "react";
import { Button, useColorModeValue } from "@chakra-ui/react";

export const CustomButton = (props) => {
  return (
    <Button
      backgroundColor={useColorModeValue("gray.300","#323e46")}
      rounded="md"
      boxShadow="0 5px 15px rgba(255, 255, 255, .4)"
      fontWeight="medium"
      borderColor="white"
      borderRadius="10px"
      borderWidth="2px"
      // outline="2px solid white"
      // outline-offset="2px"
      _hover={{
        transform: "scale(1.05)",
        textShadow: "0 0 20px #fff",
      }}
      {...props}
    >
      {props.children}
    </Button>
  );
};
