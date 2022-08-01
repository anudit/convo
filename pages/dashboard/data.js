import React, { useContext, useState } from 'react';
import { Heading, Button, Flex } from "@chakra-ui/react";
import { Blob } from "nft.storage";
import { DownloadIcon } from '@chakra-ui/icons';

import DashboardShell from '@/components/DashboardShell';
import { Web3Context } from '@/contexts/Web3Context';


const DataSection = () => {

  const { signerAddress, getAuthToken } = useContext(Web3Context);
  const [isNukeLoading, setNukeLoading] = useState(false);


  async function downloadAllData(){
      let backup = JSON.stringify([{}]);
      var blob1 = new Blob([backup], { type: "application/json;charset=utf-8" });
      var url = window.URL || window.webkitURL;
      let link = url.createObjectURL(blob1);
      var a = document.createElement("a");
      a.download = `Backup-${signerAddress}.json`;
      a.href = link;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }

  async function nukeAllData(){
    setNukeLoading(true);
    let token = await getAuthToken();
    const response = await fetch('/api/comments?apikey=CSCpPwHnkB3niBJiUjy92YGP6xVkVZbWfK8xriDO', {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            signerAddress,
            token,
            deleteAll: true,
        })
    });
    let resp = await response.json();
    if (resp?.success === true){
        alert('All your data has been nuked, It might take a few seconds to propogate across the network.')
    }
    setNukeLoading(false);
  }


  return (
    <DashboardShell active="data" title="Data" >
        <Flex direction="column" w="100%" p={3}>
            <Heading as="h4" size="md" mb={4}>
              Administration
            </Heading>
            <Flex direction={{base:"column", md:"row"}} alignItems="flex-start">
                <Button size="md" onClick={downloadAllData} m={1}>
                    <DownloadIcon w={4} h={4} mr={2}/> Download my Data
                </Button>
                <Button isLoading={isNukeLoading}size="md" colorScheme="red" onClick={nukeAllData} m={1}>
                    💣 Nuke my Data
                </Button>
            </Flex>
        </Flex>
    </DashboardShell>
  )

}

export default DataSection;
