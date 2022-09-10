import React, { useEffect } from "react";
import Head from 'next/head';
import Image from 'next/image';
import { SimpleGrid, chakra, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Heading, Text, Flex, Link, useColorMode, useColorModeValue, Button, Box, UnorderedList, ListItem, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import PropTypes from 'prop-types';

import { DataIcon, JoinIcon, ExternalIcon, ComposabilityIcon, ConsensysIcon, ProtocolLabsIcon, DiscordIcon, CoinviseIcon, DecentralandIcon, NfxIcon, GalaxyDigitalIcon, EtherealVenturesIcon, TachyonIcon } from '@/public/icons';
import { CustomButton } from '@/components/CustomButtons';
import Footer from "@/components/Footer";
import Card from '@/components/Card';
import NavBar from '@/components/NavbarV2';
import { MakeOwnCodeBlock } from "@/components/CodeBlock";
import Scene from "@/components/Models/Scene"
import Scene2 from "@/components/Models/Scene2"
import Twitter from "twitter-v2"
import TweetCard from "@/components/TweetCard";

export async function getStaticProps() {

  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  let { data: tweetData } = await client.get('tweets?tweet.fields=attachments,author_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld', {
    ids: ['1427635434293800974', '1428425109459591183', '1427682758621503488', '1422694888488030209', '1429894955053498368', '1411933457077260289', '1420395919229526016', '1425178007405309953', '1428848146675871752']
  });

  for (let index = 0; index < tweetData.length; index++) {
    const {data:userData} = await client.get(`users/${tweetData[index].author_id}?`, {
      user: { fields: 'profile_image_url' }
    });
    tweetData[index] = {...tweetData[index],userData}
  }

  return {
    props: { tweetData }
  }
}

const Home = ({tweetData}) => {

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

        this.el.innerText = this.txt;

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
        background={useColorModeValue('linear-gradient(318deg, rgba(70,50,64,1) 0%, rgba(87,68,83,1) 26%, rgba(91,79,94,1) 45%, rgba(75,74,93,1) 79%, rgba(50,50,66,1) 100%)', 'linear-gradient(28deg, rgba(9,8,18,1) 0%, rgba(26,36,51,1) 31%, rgba(37,39,55,1) 51%, rgba(39,34,47,1) 68%, rgba(32,29,41,1) 82%)')}
        // backgroundImage={useColorModeValue('url(/images/v2/lightbg.png)', 'url(/images/v2/darkbg.png)')}
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
          h={{base:"60vh", md:"70vh"}}
          w={{ base: "90%"}}
          mt={{base:"20vh", md:"15vh"}}
          zIndex="1"
          justifyContent="space-around"
        >

          <Flex
            align="center"
            justify={{ base: "center", md: "space-around", xl: "space-around" }}
            direction={{ base: "column-reverse", sm: "column-reverse", md: "column" }}
            wrap="no-wrap"
            px={{base: 0, md:6}}
            mb={16}
            minH="inherit"
          >

            <Flex
              direction="column"
              w="100%"
              align="center"
            >
              <Heading
                fontSize={{ base: "2rem", sm: "3rem", md: "3rem" }}
                as="h1" fontWeight="400" align="center"
                mb={5}
                color='whiteAlpha.800'
              >
                The Decentralized
              </Heading>
              <Heading
                as="h1"
                fontSize={{ base: "2rem", sm: "4rem", md: "4rem" }}
                fontWeight="700"
                color={useColorModeValue("black", "white")}
                lineHeight="none"
                letterSpacing="tight"
                textAlign="center"
                bgClip="text"
                bgGradient="linear-gradient(160deg, #7796de 0%, #fbcbd6 100%)"
                paddingBottom={6}
              >
                Conversation Layer
              </Heading>
              <Heading
                fontSize={{ base: "2rem", sm: "3rem", md: "3rem" }}
                as="h1" fontWeight="400" align="center"
                mb={5}
                color='whiteAlpha.800'
              >
                of Internet
              </Heading>
              <Text py={2} fontWeight={400} color={"gray.400"} mt={16} mb={2}>
                BACKED BY
              </Text>
              <SimpleGrid columns={[2, null, 3]} spacing={5} align="center">
                <Link my={{base: 2, md: 1}} mx={{base: 1, md: 2}} aria-label="Consensys" rel="noreferrer" target="_blank" href="https://mesh.xyz/tachyon/">
                  <ConsensysIcon width="150px" height="50px"/>
                </Link>
                <Link my={{base: 2, md: 1}} mx={{base: 1, md: 2}} aria-label="NFX" rel="noreferrer" target="_blank" href="https://www.nfx.com/">
                  <EtherealVenturesIcon width="150px" height="50px"/>
                </Link>
                <Link my={{base: 2, md: 1}} mx={{base: 1, md: 2}} aria-label="GD" rel="noreferrer" target="_blank" href="https://www.galaxydigital.io/">
                  <GalaxyDigitalIcon transform="scale(3)" width="150px" height="50px"/>
                </Link>
                <Link my={{base: 2, md: 1}} mx={{base: 1, md: 2}} aria-label="NFX" rel="noreferrer" target="_blank" href="https://www.nfx.com/">
                  <NfxIcon width="100px" height="50px"/>
                </Link>
                <Link my={{base: 2, md: 1}} mx={{base: 1, md: 2}} aria-label="ProtocolLabs" rel="noreferrer" target="_blank" href="https://protocol.ai/">
                  <ProtocolLabsIcon width="150px" height="50px"/>
                </Link>
                <Link my={{base: 2, md: 1}} mx={{base: 1, md: 2}} aria-label="Tachyon" rel="noreferrer" target="_blank" href="https://mesh.xyz/tachyon/">
                  <TachyonIcon width="150px" height="50px"/>
                </Link>
              </SimpleGrid>
            </Flex>

          </Flex>

          <Flex
            align="center"
            display={{base:"none",md:"flex"}}
            justify={{ base: "center", md: "space-around", xl: "space-evenly" }}
            direction="column"
            wrap="no-wrap"
            px={{base: 0, md:6}}
            mb={16}
            h={{base:"50vh", md:"70vh"}}
            w={{ base: "44%"}}
            >
              <Scene />
          </Flex>

        </Flex>

        <Flex direction={{ base: "column", md: "row"}} alignItems="center" textAlign="center" justifyContent="space-evenly" >

          <Flex direction="row" w="100%" justifyContent="center">
            <Link href="/dashboard" style={{textDecoration: 'inherit'}} mr={{ base: 0, md: 2}} >
              <CustomButton
                py={8}
                px={8}
                fontSize="30px"
                aria-label="Dashboard"
                color="white"
                backgroundColor={useColorModeValue("#7E869D","#78687B")}
              >
                Dashboard
                <ArrowForwardIcon ml={2}/>
              </CustomButton>
            </Link>
          </Flex>

        </Flex>

        <Flex direction={{ base: "column", md: "row"}} alignItems="center" textAlign="center" justifyContent="space-evenly" my={8} py={8}>

          <Heading
            as="h1"
            fontSize={{base:"30px", md:"50px"}}
            fontWeight="300"
            color={useColorModeValue("whiteAlpha.700","gray.400")}
            lineHeight="none"
            letterSpacing="tight"
            textAlign="center"
          >
            Convo offers all the Tooling and Infrastructure to add a
            <br/>
              Social Layer to
            <Flex
              display="inline-flex"
              bgClip="text"
              bgGradient="-webkit-linear-gradient(160deg, rgba(182,204,255,1) 0%, rgba(253,192, 206,1) 100%)"
              color="rgba(217, 156, 177, 0.94)"
              fontWeight="800"
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
            supercharged by Web3.
          </Heading>

        </Flex>

        <Flex
          direction="row"
          m="0 auto"
          w={{ base: "96%"}}
          minH="80vh"
          mt={{base:32, md:4}}
          justifyContent="center"
        >

          <Flex
            direction="column"
            align="left"
            mt={8}
            w="38%"
            justifyContent="center"
            alignItems="center"
            display={{base:"none",md:"flex"}}
          >
            <Scene2/>
          </Flex>

          <Flex
              direction="column"
              align="left"
              mt={8}
              w={{base:"100%", md:"58%"}}
              justifyContent="center"
              alignItems="center"
            >

            <Heading
              as="h1"
              fontSize={{ base: "2rem", md: "2rem", lg: "3rem", xl: "3rem" }}
              fontWeight="700"
              lineHeight="none"
              letterSpacing="tight"
              textAlign="center"
              color="white"
              // bgClip="text"
              // bgGradient="linear-gradient(160deg, #0048e9 0%, #39ffe9 100%)"
              paddingBottom={6}
            >
              Organizations using Convo
            </Heading>

            <Tabs variant="soft-rounded" colorScheme={useColorModeValue("blackAlpha","whiteAlpha")} w="100%">
              <Flex
                direction="column"
                align="left"
                mt={8}
                w="100%"
                justifyContent="center"
                alignItems="center"
              >
                <Flex direction="column" justifyContent="center" alignItems="center" w="100%">
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
                        rel="noopener"
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
                          bg={useColorModeValue("gray.800","gray.800")}
                          mt={{base:0, md:-20}}
                          shadow="lg"
                          rounded="lg"
                          overflow="hidden"
                        >
                          <Flex
                            alignItems="center"
                            justifyContent="center"
                            minH="70px"
                            py={2}
                            px={4}
                            backdropFilter="blur(100px) opacity(1)"
                            color="white"
                          >
                            <Text fontSize="md" align="center" lineHeight="20px">
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
                        rel="noopener"
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
                          bg="white"
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
                            color="white"
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
                        rel="noopener"
                      >
                        <video controls autoPlay loop width="700px" height="350px" className="br-10">
                          <source src="https://res.cloudinary.com/anudit/video/upload/v1659766317/convo/ConvoxDecentraland.mp4" type="video/mp4" />
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
                            color="white"
                          >
                            <Text fontSize="xl" align="center">Make Conversations and Interactions accessible Across Platforms like Decentraland</Text>
                          </Flex>
                        </Box>
                      </Flex>
                    </TabPanel>
                  </TabPanels>
                </Flex>

                <Flex direction="column" justifyContent="center" alignItems="center" w="100%">
                  <TabList display="flex" flexDirection={{base:"column", md:"row"}} w="100%">
                    <Tab w="100%" h="100px" display="flex" flexDirection="row" borderRadius={4} aria-label="Coinvise">
                      <CoinviseIcon boxSize={32}/>
                    </Tab>
                    <Tab w="100%" h="100px" display="flex" flexDirection="row" borderRadius={4}>
                      <Image src="/images/usingconvo/huddln.webp" width="30px" height="30px" alt="Huddln" p={2} aria-label="Huddln"/>
                      <Text fontSize="1xl" p={2} color="#fff">Huddln</Text>
                    </Tab>
                    <Tab w="100%" h="100px" display="flex" flexDirection="row" borderRadius={4} aria-label="Decentraland">
                      <DecentralandIcon boxSize={8}/>
                      <Text fontSize="1xl" p={2} color="#fff">Decentraland</Text>
                    </Tab>
                  </TabList>
                </Flex>
              </Flex>
            </Tabs>
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
            bgGradient="linear-gradient(160deg, #7796de 0%, #fbcbd6 100%)"
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
            bgGradient="linear-gradient(160deg, #375fbb 0%, #e8a7b6 100%)"
            py={12}
          >
            Try it Out.
          </Heading>

          <Flex width={{ base: "95vw", md:"80vw", lg:"60vw"}} direction="column">
            <Text my={2} fontWeight="500" fontSize={18} align="center">
              Just a single line of code, to get you started.
            </Text>
            <MakeOwnCodeBlock
              value={`"${typeof window !="undefined"? window.location.origin : process.env.NEXT_PUBLIC_API_SITE_URL}/embed/dt?threadId=KIGZUnR4RzXDFheXoOwo"`}
            />
            <br/>
            <iframe title="Comments Page Demo" src={"/embed/dt?threadId=KIGZUnR4RzXDFheXoOwo&height=500&theme=" + colorMode} loading="lazy" width="100%" height="650px" style={{overflow:"hidden", background:"transparent"}}>
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
          justifyContent="center"
          margin="0 auto"
          w="100%"
          minH="90vh"
          py={8}
          mt={16}
          mb={2}
        >
          <Heading
            as="h1"
            fontSize={{ base: "2rem", md: "2rem", lg: "3rem", xl: "4rem" }}
            fontWeight="700"
            color={useColorModeValue("black", "white")}
            lineHeight="none"
            letterSpacing="tight"
            textAlign="center"
            bgClip="text"
            bgGradient="linear-gradient(160deg, #375fbb 0%, #e8a7b6 100%)"
            py={12}
          >
            Community
          </Heading>

          <Box
            padding={4}
            w="100%"
            maxW={{base:"95%", md:"1500px"}}
            mx="auto"
            sx={{ columnCount: [1, 1, 2, 3], columnGap: "8px" }}
          >
            {
              Boolean(tweetData) === true && tweetData.map((tweet, index) => {
                return (
                  <TweetCard tweet={tweet} key={index}/>
                )
              })
            }
          </Box>
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
                  <Text fontSize="25px" fontWeight={800} color={useColorModeValue("black", "white")}>
                    Why Convo ?
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <UnorderedList spacing={2} color={useColorModeValue("black", "white")}>
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
                    <Text fontSize="25px" fontWeight={800} color={useColorModeValue("black", "white")}>
                      What can I build with Convo ?
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </Text>
              <AccordionPanel pb={4}>
              <UnorderedList spacing={2} color={useColorModeValue("black", "white")}>
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
                    <Text fontSize="25px" fontWeight={800} color={useColorModeValue("black", "white")}>
                      How do I get started ?
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <UnorderedList spacing={2} color={useColorModeValue("black", "white")}>
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
                    <Text fontSize="25px" fontWeight={800} color={useColorModeValue("black", "white")}>
                      Where can I get my queries answered ?
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <UnorderedList spacing={2} color={useColorModeValue("black", "white")}>
                  <ListItem>
                    Twitter: <chakra.a _hover={{textDecoration:'underline'}} href="https://twitter.com/anuditnagar" rel="noreferrer" target="_blank">https://twitter.com/anuditnagar</chakra.a>
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

Home.propTypes = {
  tweetData: PropTypes.array,
}
