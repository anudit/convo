import React from "react";
import { Flex } from "@chakra-ui/react";
import Head from 'next/head';
import PropTypes from 'prop-types';

import NavBar from '@/components/NavBar';

const PageShell = ({title, metaImageLink, align, children}) => {

  return (
    <>
      <Head>
        <title>{title}</title>
        {
          Boolean(metaImageLink) === true ? (
            <>
              <meta name='twitter:image' content={metaImageLink} />
              <meta property='og:image' content={metaImageLink} />
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
        align={Boolean(align) === true ? align : "center"}
        maxW="1600px"
        w={{ base: "95%", md: "80%", lg: "90%"}}
        m="0 auto"
        mt="10vh"
      >
        {children}
      </Flex>
    </>
  );
};

PageShell.propTypes = {
  title:PropTypes.string,
  metaImageLink:PropTypes.string,
  align:PropTypes.string,
  children:PropTypes.array
}

export default PageShell;
