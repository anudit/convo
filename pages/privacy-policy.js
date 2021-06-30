import React from "react";
import { Heading, useColorModeValue, Text, UnorderedList, ListItem } from "@chakra-ui/react";
import PageShell from '@/components/PageShell';
import Footer from '@/components/Footer';

const PP = () => {

    return (
        <>
            <PageShell key='one' title={`The Convo Space | Documentation` } align="left">
                <Heading
                    as="h1"
                    py={4}
                    fontWeight={700}
                    color={useColorModeValue("black", "white")}
                    transition="text-shadow 0.5s"
                    fontSize={{ base: "2rem", lg: "4rem"}}
                    align="center"
                >
                    Privacy Policy
                </Heading>

                <Text fontSize="md">
                    At The Convo Space (&quot;Convo, Inc&quot;), accessible from https://theconvo.space, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by The Convo Space and how we use it.
                    <br/>
                    If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at nagaranudit@gmail.com .
                    <br/>
                    This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in The Convo Space. This policy is not applicable to any information collected offline or via channels other than this website.
                    <br/>
                </Text>

                <Heading
                    as="h2"
                    py={4}
                    fontWeight={700}
                    color={useColorModeValue("black", "white")}
                    transition="text-shadow 0.5s"
                    fontSize={{ base: "1rem", lg: "2rem"}}
                >
                    Consent
                </Heading>

                <Text>
                    By using our website, you hereby consent to our Privacy Policy and agree to its terms.
                </Text>

                <Heading
                    as="h2"
                    py={4}
                    fontWeight={700}
                    color={useColorModeValue("black", "white")}
                    transition="text-shadow 0.5s"
                    fontSize={{ base: "1rem", lg: "2rem"}}
                >
                    Information we collect
                </Heading>

                <Text>
                    The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
                    <br/>
                    If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
                    <br/>
                    When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.
                    <br/>
                </Text>

                <Heading
                    as="h2"
                    py={4}
                    fontWeight={700}
                    color={useColorModeValue("black", "white")}
                    transition="text-shadow 0.5s"
                    fontSize={{ base: "1rem", lg: "2rem"}}
                >
                    How we use your information
                </Heading>

                <Text>

                    We use the information we collect in various ways, including to:

                    <UnorderedList>
                        <ListItem>Provide, operate, and maintain our website</ListItem>
                        <ListItem>Improve, personalize, and expand our website</ListItem>
                        <ListItem>Understand and analyze how you use our website</ListItem>
                        <ListItem>Develop new products, services, features, and functionality</ListItem>
                        <ListItem>Send you emails, if you have subscribed</ListItem>
                        <ListItem>Log Files, The Convo Space follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services&apos; analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, and gathering demographic information.</ListItem>
                    </UnorderedList>

                </Text>

                <Heading
                    as="h2"
                    py={4}
                    fontWeight={700}
                    color={useColorModeValue("black", "white")}
                    transition="text-shadow 0.5s"
                    fontSize={{ base: "1rem", lg: "2rem"}}
                >
                    Cookies and Web Beacons
                </Heading>

                <Text>
                    Like any other website, The Convo Space uses &apos;cookies&apos;. These cookies are used to store information including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users&apos; experience by customizing our web page content based on visitors&apos; browser type and/or other information.
                    <br/>
                    For more general information on cookies, please read &quot;What Are Cookies&quot;.
                    <br/>
                </Text>

                <Heading
                    as="h2"
                    py={4}
                    fontWeight={700}
                    color={useColorModeValue("black", "white")}
                    transition="text-shadow 0.5s"
                    fontSize={{ base: "1rem", lg: "2rem"}}
                >
                    Advertising Partners Privacy Policies
                </Heading>

                <Text>
                    You may consult this list to find the Privacy Policy for each of the advertising partners of The Convo Space.
                    <br/>
                    Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on The Convo Space, which are sent directly to users&apos; browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
                    <br/>
                    Note that The Convo Space has no access to or control over these cookies that are used by third-party advertisers.
                    <br/>
                </Text>


                <Heading
                    as="h2"
                    py={4}
                    fontWeight={700}
                    color={useColorModeValue("black", "white")}
                    transition="text-shadow 0.5s"
                    fontSize={{ base: "1rem", lg: "2rem"}}
                >
                    Third Party Privacy Policies
                </Heading>

                <Text>
                    The Convo Space&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
                    <br/>
                    You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers&apos; respective websites.
                    <br/>
                </Text>

                <Heading
                    as="h2"
                    py={4}
                    fontWeight={700}
                    color={useColorModeValue("black", "white")}
                    transition="text-shadow 0.5s"
                    fontSize={{ base: "1rem", lg: "2rem"}}
                >
                    CCPA Privacy Rights (Do Not Sell My Personal Information)
                </Heading>

                <Text>

                    Under the CCPA, among other rights, California consumers have the right to:
                    <br/>

                    <UnorderedList>
                        <ListItem>Request that a business that collects a consumer&apos;s personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</ListItem>
                        <ListItem>Request that a business delete any personal data about the consumer that a business has collected.</ListItem>
                        <ListItem>Request that a business that sells a consumer&apos;s personal data, not sell the consumer&apos;s personal data.</ListItem>
                        <ListItem>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</ListItem>
                    </UnorderedList>

                </Text>

                <Heading
                    as="h2"
                    py={4}
                    fontWeight={700}
                    color={useColorModeValue("black", "white")}
                    transition="text-shadow 0.5s"
                    fontSize={{ base: "1rem", lg: "2rem"}}
                >
                    GDPR Data Protection Rights
                </Heading>

                <Text>
                    We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
                    <br/>
                    <UnorderedList>
                        <ListItem>The right to access – You have the right to request copies of your personal data. We may charge you a small fee for this service.</ListItem>
                        <ListItem>The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</ListItem>
                        <ListItem>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</ListItem>
                        <ListItem>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</ListItem>
                        <ListItem>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</ListItem>
                        <ListItem>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</ListItem>
                        <ListItem>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</ListItem>
                    </UnorderedList>
                </Text>

                <Heading
                    as="h2"
                    py={4}
                    fontWeight={700}
                    color={useColorModeValue("black", "white")}
                    transition="text-shadow 0.5s"
                    fontSize={{ base: "1rem", lg: "2rem"}}
                >
                    Children&apos;s Information
                </Heading>

                <Text>
                    Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
                    <br/>
                    The Convo Space does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
                    <br/>
                </Text>
                <br/>
                <br/>
            </PageShell>
            <Footer />
        </>
    );

};

export default PP;
