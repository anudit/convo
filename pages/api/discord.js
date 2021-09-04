import withDiscordInteraction from "middlewares/discordInteraction"
import withErrorHandler from "middlewares/errorHandler"
import { bridgeReverseLookup, joinThreadOnBridge } from "@/lib/bridge"
import { createComment } from "@/lib/thread-db"

const BASE_RESPONSE = { type: 4 }
const INVALID_COMMAND_RESPONSE = { ...BASE_RESPONSE, data: { content: "Oops! I don't recognize this command." } }
const PING_COMMAND_RESPONSE = { ...BASE_RESPONSE, data: { content: "Pong" } }
const HELP_COMMAND_RESPONSE = { ...BASE_RESPONSE, data: { content: `**\`/help\`** Get Help \n**\`/bridge\`** Get Bridge Details \n**\`/join\`** Join a Thread \nRead more about this in the [Docs](https://docs.theconvo.space/integrate/Convo-Bridge/bridge)` } }
const BRIDGE_COMMAND_RESPONSE = { ...BASE_RESPONSE, data: { content: `🌉 Bridge your Web2 Accounts to Web3 by connecting your Accounts on [bridge.theconvo.space](https://bridge.theconvo.space/)` } }
const JOINED_THREAD_RESPONSE = { ...BASE_RESPONSE, data: { content: `🎉 Joined thread` } }
const INVALID_THREAD_RESPONSE = { ...BASE_RESPONSE, data: { content: `⚠️ Invalid threadId` } }

// disable body parsing, need the raw body as per https://discord.com/developers/docs/interactions/slash-commands#security-and-authorization
export const config = {
  api: {
    bodyParser: false,
  },
}

const handler = async (req, res, interaction ) => {
  const { data: { name, options } } = interaction
  // console.log(name, options);

  switch (name) {
    case "ping":
      return res.status(200).json(PING_COMMAND_RESPONSE)
    case "help":
      return res.status(200).json(HELP_COMMAND_RESPONSE)
    case "bridge":
      return res.status(200).json(BRIDGE_COMMAND_RESPONSE)
    case "status":{
      let bridgeData = await  bridgeReverseLookup(
        'discord',
        interaction['user']['username']+"#"+interaction['user']['discriminator']
      );
      if (bridgeData?.success === true){
        return res.status(200).json({
          ...BASE_RESPONSE,
          data: {
            content: Boolean(bridgeData['discordState']) === true ? `Joined the threadId: ${bridgeData?.discordState}` : "You've not joined a Thread currently."
          }
        })
      }
      else {
        return res.status(200).json({
          ...BASE_RESPONSE,
          data: {
            content: "You've not joined a Thread currently."
          }
        })
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
            return res.status(200).json(JOINED_THREAD_RESPONSE)
          }
          else{
            return res.status(200).json(INVALID_THREAD_RESPONSE)
          }
        });
      }
      else {
        return res.status(200).json(INVALID_THREAD_RESPONSE)
      }
    }
    case "send":{
      if (Boolean(options[0]?.value) === false) {
        return res.status(200).json({
          ...BASE_RESPONSE,
          data: {
            content: "Can't send an Empty Message."
          }
        })
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
                'replyTo': ""
            };
            let retId = await createComment(commentData);
            // console.log('retId', retId);
            if (Boolean(retId) === false) {
              return res.status(200).json({
                ...BASE_RESPONSE,
                data: {
                  content: "🚨 Message Delivery Failed"
                }
              })
            }
            else {
              return res.status(200).json({
                ...BASE_RESPONSE,
                data: {
                  content: "✔️ Sent."
                }
              });
            }
          }
          else {
            return res.status(200).json({
              ...BASE_RESPONSE,
              data: {
                content: "You've not joined a Thread currently."
              }
            })
          }
        }
        else {
          return res.status(200).json({
            ...BASE_RESPONSE,
            data: {
              content: "You have'nt bridged your account yet, Send `/bridge` to learn how to do that."
            }
          })
        }
      }
    }
    default:
      return res.status(200).json(INVALID_COMMAND_RESPONSE)
  }
}

export default withErrorHandler(withDiscordInteraction(handler))
