import { Flex, Button } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons"

const AccountSection = (props) => {

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
        console.log("TODO: nukeAllData");
    }

    return (
        <Flex direction="row">
            <Button size="md" onClick={downloadAllData}>
                <DownloadIcon w={4} h={4} mr={2}/> Download my Data
            </Button>
            <Button mx={2} size="md" colorScheme="red" onClick={nukeAllData}>
                💣 Nuke my Data
            </Button>
        </Flex>
    )
}

export default AccountSection;
