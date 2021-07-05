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
              <meta property="og:image:type" content="image/jpg" />
              <meta property="og:image:width" content="1920" />
              <meta property="og:image:height" content="1080" />
            </>
          ) :
          (
            <>
              <meta name='twitter:image' content='https://theconvo.space/images/poster.webp' />
              <meta property='og:image' content='https://theconvo.space/images/poster.webp' />
              <meta property="og:image:type" content="image/webp" />
              <meta property="og:image:width" content="1280" />
              <meta property="og:image:height" content="720" />
            </>
          )
        }
      </Head>
      <NavBar/>
      <Flex
        direction="column"
        align={Boolean(props?.align) === true ? props.align : "center"}
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
