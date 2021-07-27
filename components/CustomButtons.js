import React from "react";
import { Button, useColorModeValue } from "@chakra-ui/react";

export const CustomButton = (props) => {
  return (
    <Button
      backgroundColor={useColorModeValue("gray.300","#323e46")}
      rounded="md"
      fontWeight="medium"
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
