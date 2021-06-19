import React, { useState } from "react";
import Head from 'next/head';
import { Tooltip, Heading, Text, Flex, Link, useColorModeValue, SimpleGrid, Input, Switch, FormControl , FormLabel } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import Typewriter from 'typewriter-effect';
import { BuildIcon, BlockchainIcon, DevfolioIcon, VoteIcon, ExternalIcon } from '@/public/icons';

import { CustomButton } from '@/components/CustomButtons';
import Footer from "@/components/Footer";
import Card from '@/components/Card';
import NavBar from '@/components/NavbarNoAuth';
import CodeBlock from '@/components/CodeBlock';

const Home = () => {

  const [makeyourown_link, setmakeyourown_link] = useState("");
  const [makeyourown_uid, setmakeyourown_uid] = useState("");
  const [makeyourown_themeIsDark, setmakeyourown_themeIsDark] = useState("");

  async function updateUID(event){
    setmakeyourown_uid(event.target.value);
  }
  async function updateLink(event){
    setmakeyourown_link(event.target.value);
  }
  async function makeyourown_themeToggle(event){
    setmakeyourown_themeIsDark(event.target.checked);
  }

  return (
    <>
      <Head>
        <title>The Convo Space</title>
      </Head>

      <Flex w="100%"
        background={useColorModeValue("radial-gradient(at top right,white,white,white)", "linear-gradient(180deg, #151519, black 70%)")}
        backgroundSize="cover"
        backgroundAttachment="fixed"
        backgroundRepeat="no-repeat"
        direction="column"
      >

        <NavBar/>

        <Flex
          // backgroundImage="radial-gradient( 98.44% 95.14% at -0.8% 0%, #f563ff 0%, rgba(8, 255, 255, 0.5) 10.76%, rgba(15, 255, 231, 0.35) 30%, rgba(255, 120, 147, 0.1) 55%, rgba(0, 5, 15, 0) 86% ),linear-gradient(#000, #000)"
          // backgroundSize="cover"
          direction="column"
          align="center"
          m="0 auto"
          h="100vh"
          w={{ base: "95%"}}
          mt="10vh"
          zIndex="1"
        >

          <Flex
            align="center"
            justify={{ base: "center", md: "space-around", xl: "space-between" }}
            direction={{ base: "column-reverse", sm: "column-reverse", md: "row" }}
            wrap="no-wrap"
            px={{base: 0, md:6}}
            mb={16}
            minH="90vh"
          >

            <Flex
              direction="column"
              w="100%"
              align="center"
            >

              <Flex align="center"
              style={{
                borderRadius:'30px',
                paddingTop: "10px",
                paddingBottom: "10px",
                paddingRight: "15px",
                paddingLeft: "15px"
              }}
              fontSize="large"
              className="gradientShadow"
              backgroundColor={useColorModeValue('white','black')}
              mb={2}
              >
                <Text fontWeight={400} align="center" lineHeight="20px">
                  Early-access is now live ✨
                </Text>
              </Flex>

              <Heading
                fontSize={{ base: "2rem", sm: "2.5rem", md: "4rem", lg: "5rem", xl: "5rem" }}
                as="h1" fontWeight="700" align="center"
                color={useColorModeValue('blackAlpha.800','whiteAlpha.800')}
              >
                The Decentralized
              </Heading>

              <Flex direction={{ base: "column", md: "row"}}>
                <Heading
                  my="-15px"
                  as="h1"
                  fontSize={{ base: "3.5rem", sm: "4.8rem", md: "5.3rem", lg: "6.5rem", xl: "8rem" }}
                  fontWeight="800"
                  letterSpacing="tight"
                  bgClip="text"
                  bgGradient="linear-gradient(160deg, #0048e9 0%, #39ffe9 100%)"
                  align="center"
                  pb={2}
                  pr={{ base: 0, md: 5}}
                  // backgroundImage="url('/gradient.gif')"
                  backgroundSize="cover"
                >
                  Conversation
                </Heading>

                <Heading
                  my="-15px"
                  as="h1"
                  fontSize={{ base: "3.5rem", sm: "4.8rem", md: "5.3rem", lg: "6.5rem", xl: "8rem" }}
                  fontWeight="800"
                  letterSpacing="tight"
                  bgClip="text"
                  bgGradient="linear-gradient(160deg, #39ffe9 0%, #0048e9 100%)"
                  align="center"
                  pb={2}
                  // backgroundImage="url('/gradient.gif')"
                  backgroundSize="cover"
                >
                  Layer
                </Heading>
              </Flex>

              <Heading
                fontSize={{ base: "2rem", sm: "3rem", md: "4rem", lg: "5rem", xl: "5rem" }}
                as="h1" fontWeight="700" align="center"
                color={useColorModeValue('blackAlpha.800','whiteAlpha.800')}
              >
                of Internet
              </Heading>

              <br/>

              <Heading
                as="h1"
                fontSize={{base:"x-large", md:"xx-large"}}
                fontWeight="100"
                color={useColorModeValue("blackAlpha.800", "gray.400")}
                lineHeight="none"
                letterSpacing="tight"
                textAlign="center"
              >
                Convo is the substrate that connects conversations and communities
                <br/>
                 on
                <Flex
                  display="inline-flex"
                  color="#2065ff"
                  mx={2}
                >
                  <Typewriter
                    options={{
                      strings: [
                        'NFTs,',
                        'proposals,',
                        'wallets,',
                        'blogs,',
                        'NFTs,',
                        'websites,',
                        'mobile apps,',
                      ],
                      autoStart: true,
                      loop: true,
                    }}
                  />
                </Flex>
                across the Internet.
              </Heading>


              <br/>

              <Flex direction={{ base: "column", md: "row"}} alignItems="center">
                <Link href="/explore" style={{textDecoration: 'inherit'}} mr={{ base: 0, md: 2}}>
                  <CustomButton
                    py={6}
                    px={8}
                    fontSize="larger"
                    aria-label="Explore Convo"
                    color="white"
                    backgroundColor={useColorModeValue("#1f30a7","#1f30a7")}
                  >
                    Explore Convo <ArrowForwardIcon ml={2}/>
                  </CustomButton>
                </Link>
              </Flex>
              <br/><br/>

              <Text py={2} fontWeight={400} color={useColorModeValue("blackAlpha.800", "gray.400")}>
                BACKED BY
              </Text>
              <Link aria-label="Devfolio" rel="noreferrer" target="_blank" href="https://devfolio.co/blog/first-bif-cohort/">
                <DevfolioIcon width="200px" height="50px"/>
              </Link>
            </Flex>

          </Flex>

        </Flex>

        <Flex
          direction="column"
          align="center"
          m="0 auto"
          w={{ base: "95%"}}
          minH="80vh"
          mt={{base:32, md:4}}
          justifyContent="center"
        >

          <Heading
            as="h1"
            fontSize={{ base: "2rem", md: "2rem", lg: "3rem", xl: "6rem" }}
            fontWeight="700"
            color={useColorModeValue("black", "white")}
            lineHeight="none"
            letterSpacing="tight"
            textAlign="center"
            bgClip="text"
            bgGradient="linear-gradient(160deg, #0048e9 0%, #39ffe9 100%)"
            paddingBottom={6}
          >
            Conversations, <wbr />Simplified.
          </Heading>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3, xl: 3 }}
            spacingX={{ base: "10px", md: "5px", lg: "5px", xl: "80px" }}
            spacingY="20px"
            py={10}
            align="left"
          >

            <Card
              title="Decentralized System"
              icon={
                <BlockchainIcon
                  aria-label="Decentralized"
                  boxSize={10}
                />
              }
              internalLink=""
            >
              <Text mt={2} mb={5} fontWeight="400" fontSize={20} color={useColorModeValue("blackAlpha.800", "gray.400")}>
                The Convo Space is intended to be fully decentralized, utilizing Textile&apos;s ThreadDB built on IPFS and Libp2p for Storage ensuring that your data lives independent of the interface.
              </Text>
            </Card>

            <Card
              title="Community Governed"
              icon={
                <VoteIcon
                  aria-label="community governed"
                  boxSize={10}
                />
              }
              internalLink="learn/conviction-voting"
            >
              <Text mt={2} mb={5} fontWeight="400" fontSize={20} color={useColorModeValue("blackAlpha.800", "gray.400")}>
                Moderation powered by Conviction Voting is a crucial part of the system to ensure the dialogue between participants is effective and governed by the people and not the platform.
              </Text>
            </Card>


            <Card
              title="Extensible Framework"
              icon={
                <BuildIcon
                  aria-label="Extensible Framework"
                  boxSize={10}
                />
              }
              internalLink="integrate/embeddable-convo"
              >
              <Text mt={2} mb={5} fontWeight="400" fontSize={20} color={useColorModeValue("blackAlpha.800", "gray.400")}>
                Convo can be used as a singular layer to manage your conversations throughout the Internet and can be used to build upon and integrated into any application with Convo&apos;s API.
              </Text>
            </Card>

          </SimpleGrid>

        </Flex>

        <Flex
          direction="column"
          align="center"
          margin="0 auto"
          w={{ base: "95%"}}
          minH="90vh"
          py={8}
          mt={16}
          mb={2}
        >
          <Heading
            as="h1"
            fontSize={{ base: "2rem", md: "2rem", lg: "3rem", xl: "6rem" }}
            fontWeight="700"
            color={useColorModeValue("black", "white")}
            lineHeight="none"
            letterSpacing="tight"
            textAlign="center"
            bgClip="text"
            bgGradient="linear(to-r, green.400,purple.500)"
            animation="hue 10s infinite linear"
            py={12}
          >
            Try it Out.
          </Heading>

          <Flex width={{ base: "95vw", md:"80vw", lg:"60vw"}} direction="column">
            <Text my={2} fontWeight="500" fontSize={18} align="center">
              Just a single line of code, to get you started.
            </Text>
            <CodeBlock
              language="html"
              code={`<iframe src="${process.env.NEXT_PUBLIC_API_SITE_URL}/embed/t/KIGZUnR4RzXDFheXoOwo" allowtransparency="true" loading="eager" />`}
            />
            <br/>
            <iframe title="Comments Page Demo" src="/embed/t/KIGZUnR4RzXDFheXoOwo" width="100%" height="450px" allowtransparency="true" loading="lazy" style={{overflow:"hidden"}}>
              Comments Page Demo
            </iframe>
          </Flex>
          <br/>
          <Link href="https://docs.theconvo.space" aria-label="View Docs" rel="noreferrer" target="_blank" style={{textDecoration: 'inherit'}} fontSize="x-large">
            View Docs<ExternalIcon ml={1}/>
          </Link>


        </Flex>

        <Flex
          direction="column"
          align="center"
          margin="0 auto"
          w={{ base: "95%"}}
          minH="80vh"
          justifyContent="center"
          py={8}
          mt={4}
          mb={2}
        >
          <Heading
            as="h1"
            fontSize={{ base: "2rem", md: "2rem", lg: "3rem", xl: "6rem" }}
            fontWeight="700"
            color={useColorModeValue("black", "white")}
            lineHeight="none"
            letterSpacing="tight"
            textAlign="center"
            bgClip="text"
            bgGradient="linear(to-r, green.400,purple.500)"
            animation="hue 10s infinite linear"
            py={12}
          >
            Make your Own.
          </Heading>

          <Flex width={{ base: "95vw", md:"80vw", lg:"60vw"}} direction="column">
            <Flex direction={{ base: "column", md:"row"}} align="center" justifyContent="center">
              <Input
                placeholder="Website Link"
                padding="30px"
                fontSize="20px"
                type="text"
                borderRadius="10px"
                mr="10px"
                w={{ base: "300px", md: "400px" }}
                onChange={updateLink}
              />
              <Tooltip label="A key that uniquely identifies this comment box from the other ones on across website." aria-label="Unique Id" bg="blue.200" hasArrow>
                <Input
                  placeholder="Unique ID"
                  padding="30px"
                  fontSize="20px"
                  type="text"
                  borderRadius="10px"
                  mr="10px"
                  w={{ base: "300px", md: "400px" }}
                  onChange={updateUID}
                />
              </Tooltip>
            </Flex>
            <FormControl display="flex" justifyContent="center" mt={2}>
              <FormLabel htmlFor="themeKey" mb="0">
                Dark Themed?
              </FormLabel>
              <Switch id="themeKey" size="md" onChange={makeyourown_themeToggle}/>
            </FormControl>
            <br/>
            <CodeBlock
              language="html"
              code={`<iframe src="${process.env.NEXT_PUBLIC_API_SITE_URL}/embed/dt?url=${encodeURIComponent(makeyourown_link)}&threadId=${makeyourown_uid}&theme=${makeyourown_themeIsDark?"dark":"light"}" allowtransparency="true" loading="eager" />`}
            />
          </Flex>
        </Flex>

        {/* <Flex
          direction="column"
          align="center"
          w={{ base: "70%"}}
          margin="0 auto"
          mb={6}
        >
          <SubscribeCard/>
        </Flex> */}

      </Flex>
      <Footer/>

    </>
  );
};

export default Home;
