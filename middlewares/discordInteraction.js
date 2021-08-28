import nacl from "tweetnacl"
import { parseRawBodyAsString } from "@/utils/bodyParser"

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY

export const verifyHeaders = ({ timestamp, rawBody, signature }) => {
  return nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, "hex"),
    Buffer.from(DISCORD_PUBLIC_KEY, "hex")
  )
}

const withDiscordInteraction = (next) => async (req, res ) => {
  const signature = req.headers["x-signature-ed25519"]
  const timestamp = req.headers["x-signature-timestamp"]
  if (typeof signature !== "string" || typeof timestamp !== "string") {
    return res.status(401).end("invalid request signature")
  }

  try {
    const rawBody = await parseRawBodyAsString(req)
    const isVerified = verifyHeaders({ timestamp, rawBody, signature })
    if (!isVerified) {
      return res.status(401).end("invalid request signature")
    }

    const interaction = JSON.parse(rawBody)
    const { type } = interaction

    if (type === 1) {
      // PING message, respond with ACK (part of Discord's security and authorization protocol)
      return res.status(200).json({ type: 1 })
    } else {
      return await next(req, res, interaction)
    }
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: "Oops, something went wrong parsing the request!",
    })
  }
}

export default withDiscordInteraction
