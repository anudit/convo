import { bridgeReverseLookup, joinThreadOnBridge } from "@/lib/bridge"
import { createComment } from "@/lib/thread-db"
import withSlackInteraction from "@/middlewares/slackInteraction";

const handler = async (req, res) => {

    let {command, text, user_name} = req.body;

    if (command === '/help'){
        return res.status(200).json(`🌉 Convo Bridge.\nBridge your Web2 Accounts to Web3\n\n*Step 1*\nBridge your Web2 Accounts by connecting your Wallet on https://bridge.theconvo.space/.\n\n*Step 2*\nJoin a thread by using the \`/join\` command like, \`/join\` KIGZUnR4RzXDFheXoOwo\n\n*Available Commands*\n\`/help\` Get Help.\n\`/join\` Join a Thread.\n\`/status\` Your status on the Bridge.\n\`/send\` To Send a Message.\n\nRead more about it in the Docs https://docs.theconvo.space/integrate/Convo-Bridge/bridge`)
    }
    else if (command === '/info'){
        let bridgeData = await bridgeReverseLookup('slack', user_name);
        if (bridgeData?.success === true){
            let resp = Boolean(bridgeData['slackState']) === true ? `Joined the threadId: ${bridgeData?.slackState}` : "You've not joined a Thread currently.";
            return res.status(200).json(resp)
        }
        else {
            return res.status(200).json("You've not joined a Thread currently.");
        }
    }
    else if (command === '/jointhread'){
        if (text !== '') {
            let resp = await joinThreadOnBridge('slack', user_name, text);
            if ( resp === true ){
                return res.status(200).json(`🎉 Joined thread`)
            }
            else{
                return res.status(200).json(`⚠️ Invalid threadId`)
            }
        }
        else {
            return res.status(200).json("No threadId specified.")
        }
    }
    else if (command === '/send'){
        if (text === '') {
            return res.status(200).json("Can't send an Empty Message.")
        }
        else {
            let bridgeData = await bridgeReverseLookup('slack', req.body.user_name );
            if (bridgeData?.success === true){
                if (Boolean(bridgeData?.slackState) === true){

                    let commentData = {
                        'createdOn': Date.now().toString(),
                        'author': bridgeData?.ethAddress,
                        'text': text,
                        'url': 'https://slack.com/',
                        'tid': bridgeData?.slackState,
                        'metadata' : {},
                        'tag1' : "",
                        'tag2' : "",
                        'upvotes': [],
                        'downvotes': [],
                        'chain': "ethereum",
                        'replyTo': "",
                        'editHistory': [],
                    };
                    let retId = await createComment(commentData, req.body.user_name);

                    if (Boolean(retId) === false) {
                        return res.status(200).json("🚨 Message Delivery Failed")
                    }
                    else {
                        return res.status(200).json( "✅ Sent");
                    }
                }
                else {
                    return res.status(200).json("You've not joined a Thread currently.")
                }
            }
            else {
                return res.status(200).json("You have'nt bridged your account yet, Send `/bridge` to learn how to do that.")
            }
        }
    }
    else {
        return res.status(200).json("Unrecognized");
    }

}

export default withSlackInteraction(handler)

