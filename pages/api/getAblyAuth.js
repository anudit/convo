import Ably from "ably/promises";
import withApikey from "@/middlewares/withApikey";
import withCors from "@/middlewares/withCors";

const handler = async(req, res) => {

    const client = new Ably.Realtime(process.env.ABLY_SUBSCRIBE_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'convo' });
    res.status(200).json(tokenRequestData);
}

export default withCors(withApikey(handler))
