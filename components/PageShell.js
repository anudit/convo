import { useColorModeValue, Flex } from "@chakra-ui/react";
import Head from 'next/head';

import NavBar from '@/components/NavBar';

const PageShell = (props) => {

  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <Flex
        direction="column"
        align={props?.align ? props.align : "center"}
        maxW="1600px"
        w={{ base: "95%", md: "80%", lg: "90%"}}
        m="0 auto"
      >
        <NavBar/>
      </Flex>
      <Flex
        direction="column"
        align="center"
        maxW="1600px"
        w={{ base: "95%", md: "80%", lg: "90%"}}
        m="0 auto"
      >
        {props.children}
      </Flex>
    </>
  );
};

export default PageShell;
