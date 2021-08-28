import withDiscordInteraction from "middlewares/discordInteraction"
import withErrorHandler from "middlewares/errorHandler"
import { joinThreadOnBridge } from "@/lib/bridge"

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

  switch (name) {
    case "ping":
      return res.status(200).json(PING_COMMAND_RESPONSE)
    case "help":
      return res.status(200).json(HELP_COMMAND_RESPONSE)
    case "bridge":
      return res.status(200).json(BRIDGE_COMMAND_RESPONSE)
    case "join":{

      if (Boolean(options[0]?.value) === true) {
        console.log('discord',
        interaction['user']['username']+"#"+interaction['user']['discriminator'],
        options[0].value)
        let resp = await joinThreadOnBridge(
          'discord',
          interaction['user']['username']+"#"+interaction['user']['discriminator'],
          options[0].value
        );
        if ( resp === true ){
          console.log('resp', resp);
          return res.status(200).json(JOINED_THREAD_RESPONSE)
        }
        else{
          console.log('resp', resp);
          return res.status(200).json(INVALID_THREAD_RESPONSE)
        }
      }
      else {
        return res.status(200).json(INVALID_THREAD_RESPONSE)
      }
    }
    default:
      return res.status(200).json(INVALID_COMMAND_RESPONSE)
  }
}

export default withErrorHandler(withDiscordInteraction(handler))
