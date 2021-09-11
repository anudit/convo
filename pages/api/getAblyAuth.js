import Ably from "ably/promises";
import withApikey from "@/middlewares/withApikey";

const handler = async(req, res) => {

    const client = new Ably.Realtime(process.env.ABLY_SUBSCRIBE_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'convo' });
    res.status(200).json(tokenRequestData);
}

export default withApikey(handler)
