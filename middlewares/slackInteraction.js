var crypto = require('crypto');
const qs = require('qs')

const SLACK_VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN

export const verifyHeaders = ({ timestamp, rawBody, signature }) => {
  let sig_basestring = 'v0:' + timestamp + ':' + rawBody;
  var gen_signature = 'v0=' + crypto.createHmac('sha256', SLACK_VERIFICATION_TOKEN).update(sig_basestring).digest('hex');
  return gen_signature === signature;
}

// https://api.slack.com/authentication/verifying-requests-from-slack
// https://api.slack.com/apps/A02AKLHNP42/general

const withSlackInteraction = (next) => async (req, res ) => {
  const signature = req.headers["x-slack-signature"]
  const timestamp = req.headers["x-slack-request-timestamp"];

  if (typeof signature !== "string" || typeof timestamp !== "string") {
    return res.status(401).json("invalid request signature")
  }

  let d = new Date()
  if (((d.getTime()/1000) - timestamp) > 60 * 5) {
    return res.status(401).json("Unauthorized.")
  }

  let rawBody = qs.stringify(req.body,{ format:'RFC1738' })

  const isVerified = verifyHeaders({ timestamp,rawBody, signature })

  try {

    if (!isVerified) {
      return res.status(401).json("invalid request signature")
    }

    return await next(req, res)

  } catch (err) {
    return res.status(500).json("Oops, something went wrong parsing the request!")
  }
}

export default withSlackInteraction
