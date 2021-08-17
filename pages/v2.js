import React, { useEffect } from "react";
import Head from 'next/head';
import Image from 'next/image';
import { chakra, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Heading, Text, Flex, Link, useColorMode, useColorModeValue, Button, Box, UnorderedList, ListItem, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { ArrowForwardIcon, ArrowRightIcon } from "@chakra-ui/icons";

import { DataIcon, DevfolioIcon, JoinIcon, SparklesIcon, ExternalIcon, ComposabilityIcon, ConsensysIcon, ProtocolLabsIcon, DiscordIcon, CoinviseIcon, DecentralandIcon } from '@/public/icons';
import { CustomButton } from '@/components/CustomButtons';
import Footer from "@/components/Footer";
import Card from '@/components/Card';
import NavBar from '@/components/NavbarV2';
import { MakeOwnCodeBlock } from "@/components/CodeBlock";
import Scene from "@/components/Scene"

const Home = () => {

  const { colorMode } = useColorMode();

  useEffect(() => {
    var TxtType = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    };

    TxtType.prototype.tick = function() {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = this.txt;

        var that = this;
        var delta = 200 - Math.random() * 100;

        if (this.isDeleting) { delta /= 2; }

        if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
        }

        setTimeout(function() {
        that.tick();
        }, delta);
    };
    var elements = document.getElementsByClassName('typewrite');
    for (var i=0; i<elements.length; i++) {
        var toRotate = elements[i].getAttribute('data-type');
        var period = elements[i].getAttribute('data-period');
        if (toRotate) {
          new TxtType(elements[i], JSON.parse(toRotate), period);
        }
    }
  }, []);

  return (
    <>
      <Head>
        <title>The Convo Space</title>
        <meta name='twitter:image' content='https://theconvo.space/images/poster.webp' />
        <meta property='og:image' content='https://theconvo.space/images/poster.webp' />
        <meta property="og:image:type" content="image/webp" />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="720" />
      </Head>

      <Flex w="100%"
        backgroundImage={useColorModeValue('url(/images/v2/lightbg.png)', 'url(/images/v2/darkbg.png)')}
        backgroundSize="cover"
        backgroundAttachment="fixed"
        backgroundRepeat="no-repeat"
        direction="column"
      >

        <NavBar/>

        <Flex
          // backgroundImage="radial-gradient( 98.44% 95.14% at -0.8% 0%, #f563ff 0%, rgba(8, 255, 255, 0.5) 10.76%, rgba(15, 255, 231, 0.35) 30%, rgba(255, 120, 147, 0.1) 55%, rgba(0, 5, 15, 0) 86% ),linear-gradient(#000, #000)"
          // backgroundSize="cover"
          direction="row"
          align="center"
          m="0 auto"
          h={{base:"50vh", md:"70vh"}}
          w={{ base: "90%"}}
          mt="10vh"
          zIndex="1"
          justifyContent="space-between"
        >

          <Flex
            align="left"
            justify={{ base: "center", md: "space-around", xl: "space-evenly" }}
            direction={{ base: "column-reverse", sm: "column-reverse", md: "column" }}
            wrap="no-wrap"
            px={{base: 0, md:6}}
            mb={16}
            minH="inherit"
          >

            <Flex
              direction="column"
              w="100%"
              align="left"
            >

              <Flex
                align="left"
                style={{
                  borderRadius:'5px',
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  paddingRight: "15px",
                  paddingLeft: "15px"
                }}
                fontSize="large"
                backgroundColor={useColorModeValue('#78687b3b','#78687b3b')}
                mb={4}
                w="fit-content"
              >
                <Text color='whiteAlpha.800' fontWeight={400} align="left" lineHeight="20px">
                  Early-access is now live  <SparklesIcon ml={2}/>
                </Text>
              </Flex>

              <Heading
                fontSize={{ base: "2rem", sm: "2.5rem", md: "4rem" }}
                as="h1" fontWeight="700" align="left"
                color='whiteAlpha.800'
              >
                The Decentralized
              </Heading>

              <Flex direction={{ base: "column", md: "row"}}>
                <Heading
                  my="-15px"
                  as="h1"
                  fontSize={{ base: "3.5rem", sm: "4.8rem", md: "5.3rem" }}
                  fontWeight="800"
                  letterSpacing="tight"
                  bgClip="text"
                  bgGradient="linear-gradient(160deg, #0048e9 0%, #39ffe9 100%)"
                  align="left"
                  pb={2}
                  pr={{ base: 0, md: 5}}
                  // backgroundImage="url('/images/gradient.webp')"
                  backgroundSize="cover"
                >
                  Conversation
                </Heading>

                <Heading
                  my="-15px"
                  as="h1"
                  fontSize={{ base: "3.5rem", sm: "4.8rem", md: "5.3rem" }}
                  fontWeight="800"
                  letterSpacing="tight"
                  bgClip="text"
                  bgGradient="linear-gradient(160deg, #39ffe9 0%, #0048e9 100%)"
                  align="left"
                  pb={2}
                  // backgroundImage="url('/images/gradient.webp')"
                  backgroundSize="cover"
                >
                  Layer
                </Heading>
              </Flex>

              <Heading
                fontSize={{ base: "2rem", sm: "3rem", md: "4rem" }}
                as="h1" fontWeight="700" align="left"
                color='whiteAlpha.800'
              >
                of Internet
              </Heading>

              <br/>

              <Heading
                as="h1"
                fontSize={{base:"x-large", md:"xx-large"}}
                fontWeight="100"
                color="gray.400"
                lineHeight="none"
                letterSpacing="tight"
                textAlign="left"
              >
                Convo offers all the Tooling and Infrastructure to build
                <br/>
                 Social Platforms on
                <Flex
                  display="inline-flex"
                  color="#2065ff"
                  mx={2}
                  className="typewrite" data-period="1000" data-type='[
                      "NFTs,",
                      "proposals,",
                      "wallets,",
                      "blogs,",
                      "NFTs,",
                      "websites,",
                      "mobile apps,"
                    ]'
                  >
                </Flex>
                powered by Web3.
              </Heading>

              <br/>
            </Flex>

          </Flex>
          <Flex
            align="center"
            display={{base:"none",md:"flex"}}
            justify={{ base: "center", md: "space-around", xl: "space-evenly" }}
            direction={{ base: "column-reverse", sm: "column-reverse", md: "column" }}
            wrap="no-wrap"
            px={{base: 0, md:6}}
            mb={16}
            h={{base:"50vh", md:"70vh"}}
            w={{ base: "44%"}}
          >
            <Scene />
            {/* <Image src="/images/v2/anim.gif" width="600px" height="600px" alt="animation" p={2}/> */}
          </Flex>

        </Flex>

        <Flex direction={{ base: "column", md: "row"}} alignItems="center" textAlign="left" justifyContent="space-evenly" >
          <Flex direction="row" w="45%">
            <Link href="/explore" style={{textDecoration: 'inherit'}} mr={{ base: 0, md: 2}} >
              <CustomButton
                py={6}
                px={8}
                fontSize="larger"
                aria-label="Explore Convo"
                color="white"
                backgroundColor={useColorModeValue("#78687B","#78687B")}
              >
                Explore <ArrowForwardIcon ml={2}/>
              </CustomButton>
            </Link>
          </Flex>
          <Flex direction="column">
            <Text py={2} fontWeight={400} color="#fff">
              TRUSTED BY THE INDUSTRY
            </Text>
            <Flex opacity="0.8" direction={{base:"column",md:"row"}} mt={2} w="100%" justifyContent="left" align="left">
              <Link my={{base: 2, md: 1}} ml={0} mr={{base: 1, md: 2}} aria-label="Consensys" rel="noreferrer" target="_blank" href="https://mesh.xyz/tachyon/">
                <ConsensysIcon width="200px" height="50px"/>
              </Link>
              <Link my={{base: 2, md: 1}} mx={{base: 1, md: 2}} aria-label="ProtocolLabs" rel="noreferrer" target="_blank" href="https://protocol.ai/">
                <ProtocolLabsIcon width="200px" height="50px"/>
              </Link>
              <Link my={{base: 2, md: 1}} mx={{base: 1, md: 2}} aria-label="Devfolio" rel="noreferrer" target="_blank" href="https://devfolio.co/blog/first-bif-cohort/">
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
            Live Products using Convo
          </Heading>

          <Tabs variant="soft-rounded" colorScheme={useColorModeValue("blackAlpha","whiteAlpha")} w="100%">
            <Flex
              direction={{base: "column", md: "row"}}
              align="left"
              mt={8}
              w="100%"
              justifyContent="center"
              alignItems="center"
            >

              <Flex direction="column" justifyContent="center" alignItems="center" w={{base:"90%", md:"20%"}}>
                <TabList display="flex" flexDirection="column" w="100%">
                  <Tab w="100%" h="100px" display="flex" flexDirection="row" borderRadius={4}>
                    <CoinviseIcon boxSize={48}/>
                  </Tab>
                  <Tab w="100%" h="100px" display="flex" flexDirection="row" borderRadius={4}>
                    <Image src="/images/usingconvo/huddln.webp" width="60px" height="60px" alt="Huddln" p={2}/>
                    <Text fontSize="3xl" p={2}>Huddln</Text>
                  </Tab>
                  <Tab w="100%" h="100px" display="flex" flexDirection="row" borderRadius={4}>
                    <DecentralandIcon boxSize={16}/>
                    <Text fontSize="2xl" p={2}>Decentraland</Text>
                  </Tab>
                  <Tab w="100%" h="100px" display="flex" flexDirection="row" borderRadius={4}>
                    <Text fontSize="2xl" p={2}>Use in your Project</Text>
                  </Tab>
                </TabList>
              </Flex>
              <Flex direction="column" justifyContent="center" alignItems="center" w={{base:"90%", md:"50%"}}>
                <TabPanels>
                  <TabPanel display="flex" flexDirection="column" alignItems="center" height="400px">
                    <Flex
                      direction="column"
                      justifyContent="center"
                      alignItems="center"
                      mx="auto"
                      m={1}
                      w="100%"
                      h="100%"
                      cursor="pointer"
                      as="a"
                      href="https://coinvise.co/"
                      target="_blank"
                    >
                      <Image
                        src="/images/usingconvo/coinvise.webp"
                        alt=""
                        width="640px"
                        height="360px"
                        className="br-10"
                      />

                      <Box
                        w={{base:"100%", md:"70%"}}
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        mt={{base:0, md:-20}}
                        shadow="lg"
                        rounded="lg"
                        overflow="hidden"
                      >
                        <Flex
                          alignItems="center"
                          justifyContent="center"
                          minH="100px"
                          py={2}
                          px={4}
                          backdropFilter="blur(100px) opacity(1)"
                        >
                          <Text fontSize="xl" align="center" lineHeight="20px">
                          Coinvise gives creators & communities economic freedom. It&apos;s the most simple & trusted platform to mint social tokens, manage & build incentives around them.
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>
                  </TabPanel>
                  <TabPanel display="flex" flexDirection="column" alignItems="center">
                    <Flex
                      direction="column"
                      justifyContent="center"
                      alignItems="center"
                      mx="auto"
                      m={1}
                      w="100%"
                      h="100%"
                      cursor="pointer"
                      as="a"
                      href="https://huddln.io/"
                      target="_blank"
                    >
                      <Image
                        src="/images/usingconvo/huddlnposter.webp"
                        alt=""
                        width="700px"
                        height="360px"
                        className="br-10"
                      />

                      <Box
                        w={{base:"100%", md:"60%"}}
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        mt={{base:0, md:-20}}
                        shadow="lg"
                        rounded="lg"
                        overflow="hidden"
                      >
                        <Flex
                          alignItems="center"
                          justifyContent="center"
                          minH="60px"
                          py={2}
                          px={3}
                          backdropFilter="blur(100px) opacity(1)"
                        >
                          <Text fontSize="xl" align="center">The Social Platform Built for The Creator Economy</Text>
                        </Flex>
                      </Box>
                    </Flex>

                  </TabPanel>
                  <TabPanel display="flex" flexDirection="column" alignItems="center">
                  <Flex
                      direction="column"
                      justifyContent="center"
                      alignItems="center"
                      mx="auto"
                      m={1}
                      w="100%"
                      h="100%"
                      cursor="pointer"
                      as="a"
                      href="https://dcl.theconvo.space?ENABLE_WEB3"
                      target="_blank"
                    >
                      <video controls autoPlay loop width="700px" height="350px" className="br-10">
                        <source src="https://docs.theconvo.space/ConvoxDecentraland.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>

                      <Box
                        w={{base:"100%", md:"60%"}}
                        bg={colorMode === "light" ? "white" : "gray.800"}
                        mt={{base:0, md:-20}}
                        shadow="lg"
                        rounded="lg"
                        overflow="hidden"
                      >
                        <Flex
                          alignItems="center"
                          justifyContent="center"
                          minH="60px"
                          py={2}
                          px={3}
                          backdropFilter="blur(100px) opacity(1)"
                        >
                          <Text fontSize="xl" align="center">Make Conversations and Interactions accessible Across Platforms like Decentraland</Text>
                        </Flex>
                      </Box>
                    </Flex>
                  </TabPanel>
                  <TabPanel display="flex" flexDirection="column" alignItems="center">
                    <Flex
                      w="90%" direction="column" px={4} py={2} borderRadius={2} backgroundColor={useColorModeValue("white", "#121212")} justifyContent="space-between" alignItems="left"
                    >
                      <Text fontSize="2xl">View Documentation and explore how to integrate Convo in your own Platform.</Text>
                      <Button my={2} width="fit-content" as="a" href="https://docs.theconvo.space/" target="_blank">View Docs <ArrowRightIcon ml={4}/></Button>
                    </Flex>
                    <br/>
                    <Flex
                      w="90%" direction="column" px={4} py={2} borderRadius={2} backgroundColor={useColorModeValue("white", "#121212")} justifyContent="space-between" alignItems="left"
                    >
                      <Text fontSize="2xl">Explore the API Playground and test out Convo Right in your Browser.</Text>
                      <Button my={2} width="fit-content" as="a" href="https://playground.theconvo.space/" target="_blank">Explore <ArrowRightIcon ml={4}/></Button>
                    </Flex>
                  </TabPanel>
                </TabPanels>
              </Flex>
            </Flex>
          </Tabs>

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

          <Flex
            direction={{base: "column", md: "row"}}
            align="left"
            mt={8}
          >

            <Card
              title="Continuity through Composability"
              icon={
                <ComposabilityIcon
                  aria-label="Composability"
                  boxSize={16}
                />
              }
              internalLink="integrate/embeddable-convo"
              >
              <Text mt={2} mb={5} fontWeight="400" fontSize={20} color={useColorModeValue("blackAlpha.800", "gray.400")}>
                Convo can be used as a singular layer to manage your conversations throughout the Internet, can be used to build upon and integrated into any application with Convo&apos;s API.
              </Text>
            </Card>

            <Card
              title="Own your Data, Always."
              icon={
                <DataIcon
                  aria-label="Data"
                  boxSize={16}
                />
              }
              internalLink=""
            >
              <Text mt={2} mb={5} fontWeight="400" fontSize={20} color={useColorModeValue("blackAlpha.800", "gray.400")}>
                All your Conversational Data generated on Convo is always in your control and linked to your Decentralized Identity, no other application can modify it without your approval.
              </Text>
            </Card>

            <Card
              title="Simple-to-use API Built on Web3"
              icon={
                <JoinIcon
                  aria-label="Web3"
                  boxSize={16}
                />
              }
              internalLink=""
            >
              <Text mt={2} mb={5} fontWeight="400" fontSize={20} color={useColorModeValue("blackAlpha.800", "gray.400")}>
                The Convo Space is intended to be fully decentralized, utilizing Textile&apos;s ThreadDB built on IPFS and Libp2p for Storage ensuring that your data lives independent of the interface.
              </Text>
            </Card>


          </Flex>

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
            <MakeOwnCodeBlock
              value={`"${process.env.NEXT_PUBLIC_API_SITE_URL}/embed/t/KIGZUnR4RzXDFheXoOwo"`}
            />
            <br/>
            <iframe title="Comments Page Demo" src={"/embed/t/KIGZUnR4RzXDFheXoOwo?theme=" + colorMode} loading="lazy" width="100%" height="450px" allowtransparency="true" style={{overflow:"hidden"}}>
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
          py={8}
          mt={16}
          mb={8}
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
            FAQs
          </Heading>

          <Accordion w={{base:"100%", md:"80%", lg:"60%"}} allowToggle >

            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontSize="25px" fontWeight={800}>
                    Why Convo ?
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <UnorderedList spacing={2}>
                  <ListItem>
                    Convo enables Developers build Composable Components, for Conversations that can continue anywhere on the web.
                  </ListItem>
                  <ListItem>
                    Convo unbundles the conversation layer from the Interface allowing users to truly own their data irrespective of the interface.
                  </ListItem>
                  <ListItem>
                    Developers can utilze Convo with a simple-to-use API that phases out the complexities of Web3 at Scale.
                  </ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <Text fontWeight={800}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontSize="25px" fontWeight={800}>
                      What can I build with Convo ?
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </Text>
              <AccordionPanel pb={4}>
              <UnorderedList spacing={2}>
                  <ListItem>
                    Comments on Etherscan, alerting users of a compromised contract can be made accessible on MetaMask/Rainbow Wallet to alert users before sending a transaction.
                  </ListItem>
                  <ListItem>
                    Conversations around a Proposal are usually fragmented across multiple sites like twitter, discord, governance dashboards etc. Convo allows you to comment on a site like http://snapshot.org and continue it across any other site.
                  </ListItem>
                  <ListItem>
                    Conversations around an Artwork (NFT) can move along with it to whichever marketplace/interface it is showcased on like Opensea, Showtime etc.
                  </ListItem>
                  <ListItem>
                      and many more...
                  </ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontSize="25px" fontWeight={800}>
                      How do I get started ?
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <UnorderedList spacing={2}>
                  <ListItem>
                    Checkout the docs here : <chakra.a _hover={{textDecoration:'underline'}} href="https://docs.theconvo.space/" rel="noreferrer" target="_blank">https://docs.theconvo.space/</chakra.a>
                  </ListItem>
                  <ListItem>
                  Tryout the API playground here : <chakra.a _hover={{textDecoration:'underline'}} href="https://playground.theconvo.space/" rel="noreferrer" target="_blank">https://playground.theconvo.space/</chakra.a>
                  </ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontSize="25px" fontWeight={800}>
                      Where can I get my queries answered ?
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <UnorderedList spacing={2}>
                  <ListItem>
                    Twitter: <chakra.a _hover={{textDecoration:'underline'}} href="https://twitter.com/anudit" rel="noreferrer" target="_blank">https://twitter.com/anudit</chakra.a>
                  </ListItem>
                  <ListItem>
                    Discord: <chakra.a _hover={{textDecoration:'underline'}} href="https://discord.com/invite/MFtmrng9J7" rel="noreferrer" target="_blank">https://discord.com/invite/MFtmrng9J7</chakra.a>
                  </ListItem>
                  <ListItem>
                    GitHub: <chakra.a _hover={{textDecoration:'underline'}} href="https://github.com/anudit/convo" rel="noreferrer" target="_blank">https://github.com/anudit/convo</chakra.a>
                  </ListItem>
                </UnorderedList>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Flex>

      </Flex>

      <Flex direction={{ base:"column", md:"row" }} w="100%" backgroundImage="linear-gradient(90deg, #455DFC, #9D41FD)" px={8} justifyContent="space-around" py={10}>
        <Flex direction="row" alignItems="center">
          <DiscordIcon boxSize={12} mx={4}/>
          <Flex direction="column" >
            <Text fontSize="3xl" lineHeight="25px" fontWeight="900" >Connect with the community</Text>
            <Text fontSize="md" lineHeight="15px" mt={{base:2,md:3 }}>Feel free to ask questions, report issues, and meet new people.</Text>
          </Flex>
        </Flex>
        <Flex direction="row" alignItems="center" justifyContent="center">
          <Button mt={{base:2,md:0 }} size="lg" backgroundColor="white" color="black" as="a" href="https://discord.com/invite/MFtmrng9J7" rel="noreferrer" target="_blank">
            Join the Convo Discord!
          </Button>
        </Flex>
      </Flex>
      <Footer/>

    </>
  );
};

export default Home;
