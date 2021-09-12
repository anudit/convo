import React from "react";
import PropTypes from 'prop-types';
import { Button, useColorModeValue } from "@chakra-ui/react";

export const CustomButton = (props) => {
  return (
    <Button
      backgroundColor={useColorModeValue("gray.300","#323e46")}
      rounded="lg"
      boxShadow="0 5px 15px rgba(255, 255, 255, .4)"
      fontWeight="medium"
      borderColor="white"
      borderRadius="15px"
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

CustomButton.propTypes = {
  children: PropTypes.element
}

export default CustomButton;
