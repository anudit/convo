import React from "react";
import { Heading } from "@chakra-ui/react";
import PropTypes from 'prop-types';

import PageShell from "@/components/PageShell";
import { ThreadView } from "@/components/ThreadView";
import { getAllThreads } from '@/lib/thread-db';

export async function getStaticProps() {

    const threads = await getAllThreads();
    return {
        props: {
            initialThreads: threads.map(e => {
                // eslint-disable-next-line no-unused-vars
                let { _mod, ...data } = e;
                return data;
            })
        },
        revalidate: 1
    }

}

const Threads = (props) => {

    // const { data: initialThreads, error } = useSWR(
    //     `${process.env.NEXT_PUBLIC_API_SITE_URL}/api/threads?allPublic=true&apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO`,
    //     fetcher,
    //     { fallbackData: props.initialThreads }
    // );

    // if (error) {
    //     return (
    //         <>
    //             <div>Oops, There seems to be an error!</div>
    //             <div>{error.toString()}</div>
    //         </>
    //     )
    // }
    // else {
    // }
    return (
        <PageShell title="The Convo Space | Explore">
            <Heading
                as="h1"
                fontSize={{ base: "2rem", md: "4rem" }}
                fontWeight={700}
                color="primary.800"
                textAlign={"center"}
                transition="text-shadow 0.5s"
                _hover={{
                    textShadow: "0 0 20px #fff",
                }}
            >
                Explore All Threads
            </Heading>
            <br />
            <ThreadView link={undefined} threads={props.initialThreads} exploreAll={true} />
        </PageShell>
    );

};

Threads.propTypes = {
    initialThreads: PropTypes.array,
}

export default Threads;
