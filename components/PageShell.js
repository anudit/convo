import React from "react";
import { Flex } from "@chakra-ui/react";
import Head from 'next/head';

import NavBar from '@/components/NavBar';

const PageShell = (props) => {

  return (
    <>
      <Head>
        <title>{props.title}</title>
        {
          Boolean(props?.metaImageLink) === true ? (
            <>
              <meta name='twitter:image' content={props?.metaImageLink} />
              <meta property='og:image' content={props?.metaImageLink} />
            </>
          ) :
          (
            <>
              <meta name='twitter:image' content='https://theconvo.space/images/poster.png' />
              <meta property='og:image' content='https://theconvo.space/images/poster.png' />
            </>
          )
        }
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
