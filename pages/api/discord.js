import withDiscordInteraction from "middlewares/discordInteraction"
import withErrorHandler from "middlewares/errorHandler"
import { bridgeReverseLookup, joinThreadOnBridge } from "@/lib/bridge"
import { createComment } from "@/lib/thread-db"
import { isAddress } from "ethers/lib/utils"

const BASE_RESPONSE = { type: 4 }
const helpMessage = `🌉 Convo Bridge.
Bridge your Web2 Accounts to Web3

**Step 1**
Bridge your Web2 Accounts by connecting your Wallet on [bridge.theconvo.space](https://bridge.theconvo.space/).

**Step 2**
Join a thread by using the \`/join\` command like, \`/join\` KIGZUnR4RzXDFheXoOwo

**Available Commands**
\`/help\` Get Help.
\`/join\` Join a Thread.
\`/status\` Your status on the Bridge.
\`/send\` To Send a Message.
\`/check-address\` Check if an Address is malicious.
\`/check-website\` Check if a Website is malicious.

Read more about it in the [Docs](https://docs.theconvo.space/integrate/Convo-Bridge/bridge)`;

const makeResponse = (data = "") => {
  return { ...BASE_RESPONSE, data: { content: data } }
}

// disable body parsing, need the raw body as per https://discord.com/developers/docs/interactions/slash-commands#security-and-authorization
export const config = {
  api: {
    bodyParser: false,
  },
}

const handler = async (req, res, interaction ) => {

  const { data: { name, options } } = interaction

  switch (name) {
    case "help":
      return res.status(200).json(makeResponse(helpMessage))
    case "status":{
      let bridgeData = await bridgeReverseLookup(
        'discord',
        interaction['user']['username']+"#"+interaction['user']['discriminator']
      );
      if (bridgeData?.success === true){
        res.status(200).json(makeResponse(Boolean(bridgeData['discordState']) === true ? `Joined the threadId: ${bridgeData?.discordState}` : "You've not joined a Thread currently."))
        break;
      }
      else {
        res.status(200).json(makeResponse("You've not joined a Thread currently."))
        break;
      }
    }
    case "join":{
      if (Boolean(options[0]?.value) === true) {
        return joinThreadOnBridge(
          'discord',
          interaction['user']['username']+"#"+interaction['user']['discriminator'],
          options[0].value
        ).then(resp => {
          if ( resp === true ){
            return res.status(200).json(makeResponse(`🎉 Joined thread`))
          }
          else{
            return res.status(200).json(makeResponse(`⚠️ Invalid threadId`))
          }
        });
      }
      else {
        return res.status(200).json(makeResponse(`⚠️ Invalid threadId`))
      }
    }
    case "check-website": {
      let urlData = options[0]['value'];
      urlData = urlData.includes('http') ? urlData : "https://"+urlData;
      try {
        let url = new URL(urlData);
        let resp = await fetch(`https://rpc.omnid.space/blacklist/${url.host}`).then(r=>r.json());
        if (resp['blacklisted'] === true){
          return res.status(200).json(makeResponse(`🚨 The Website is blacklisted by [${resp['list']['name']}](${resp['list']['link']})`));
        }
        else {
          return res.status(200).json(makeResponse("🟢 Website isn't blacklisted, but always exercise caution while sending transactions."))
        }
      } catch (error) {
        return res.status(200).json(makeResponse(`⚠️ Invalid Website URL, ${error}`));
      }
    }
    case "check-address": {
      try {
        if (isAddress(options[0]['value']) === true){
          let resp = await fetch(`https://rpc.omnid.space/malicious/${options[0]['value']}`).then(r=>r.json());
          if (resp['isMalicious'] === true){
            return res.status(200).json(makeResponse("🚨 " + resp['rpcResp']['error']['message']));
          }
          else {
            return res.status(200).json(makeResponse("🟢 Website isn't blacklisted, but always exercise caution while sending transactions."))
          }
        }
        else {
          return res.status(200).json(makeResponse(`❔ Not an Ethereum Address.`));
        }
      } catch (error) {
        return res.status(200).json(makeResponse(`⚠️ Invalid Request, ${error}`));
      }
    }
    case "send":{
      if (Boolean(options[0]?.value) === false) {
        return res.status(200).json(makeResponse("Can't send an Empty Message."))
      }
      else {

        let bridgeData = await bridgeReverseLookup(
          'discord',
          interaction['user']['username']+"#"+interaction['user']['discriminator']
        );
        if (bridgeData?.success === true){
          if (Boolean(bridgeData?.discordState) === true){

            let commentData = {
                'createdOn': Date.now().toString(),
                'author': bridgeData?.ethAddress,
                'text': options[0]?.value,
                'url': 'https://discord.com/',
                'tid': bridgeData?.discordState,
                'metadata' : {},
                'tag1' : "",
                'tag2' : "",
                'upvotes': [],
                'downvotes': [],
                'chain': "ethereum",
                'replyTo': "",
                'editHistory': [],
            };
            let retId = await createComment(commentData, interaction['user']['username']+"#"+interaction['user']['discriminator']);
            // console.log('retId', retId);
            if (Boolean(retId) === false) {
              return res.status(200).json(makeResponse("🚨 Message Delivery Failed"))
            }
            else {
              return res.status(200).json(makeResponse("✅ Sent"));
            }
          }
          else {
            return res.status(200).json(makeResponse("You've not joined a Thread currently."))
          }
        }
        else {
          return res.status(200).json(makeResponse("You have'nt bridged your account yet, Send `/bridge` to learn how to do that."))
        }
      }
    }
    default:
      return res.status(200).json(makeResponse("Oops! I don't recognize this command."))
  }
}

export default withErrorHandler(withDiscordInteraction(handler))
