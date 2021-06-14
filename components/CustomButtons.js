import React from "react";
import { Button, useColorModeValue } from "@chakra-ui/react";
import { motion } from 'framer-motion';

export const CustomButton = (props) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        backgroundColor={useColorModeValue("gray.300","#323e46")}
        rounded="md"
        fontWeight="medium"
        _hover={{
          textShadow: "0 0 20px #fff",
        }}
        {...props}
      >
        {props.children}
      </Button>
    </motion.div>
  );
};
