import { useColorModeValue, Flex } from "@chakra-ui/react";
import Head from 'next/head';

import NavBar from '@/components/NavBar';

const PageShell = (props) => {

  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <NavBar/>
      <Flex
        direction="column"
        align="center"
        maxW="1600px"
        w={{ base: "95%", md: "80%", lg: "90%"}}
        m="0 auto"
        mt="10vh"
      >
        {props.children}
      </Flex>
    </>
  );
};

export default PageShell;
