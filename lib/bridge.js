import { Where , ThreadID} from '@textile/hub'
import { getClient, isValidThreadId } from './thread-db';

export const getBridgeData = async (ethAddress) =>{

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
    const query = new Where('_id').eq(ethAddress);
    let snapshot = await threadClient.find(threadId, 'bridge', query);

    if (snapshot.length > 0){
        return {
            success: true,
            discord: Object.keys(snapshot[0]).includes('discordData') === true ? (snapshot[0].discordData?.username + "#"  + snapshot[0].discordData?.discriminator) : false,
            slack: Object.keys(snapshot[0]).includes('slackData') === true ? (snapshot[0].slackData?.name) : false,
            telegram: Object.keys(snapshot[0]).includes('telegramData') === true ? (snapshot[0].telegramData?.username) : false
        };
    }
    else {
        return { success: true };
    }

}

export const bridgeReverseLookup = async (type, userId) =>{

    let threadClient = await getClient();
    const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);

    let query;
    if ( type === 'telegram' ) {
        query = new Where("telegramData.username").eq(userId);

    }
    else if ( type === 'slack' ) {
        query = new Where("slackData.name").eq(userId);
    }
    else if ( type === 'discord' ) {
        let [ username, discriminator ] = decodeURIComponent(userId).split('#');
        query = new Where("discordData.username").eq(username).and("discordData.discriminator").eq(discriminator);
    }
    else {
        return { success: false, message: "Invalid type or id."};
    }

    const snapshot = await threadClient.find(threadId, 'bridge', query);

    if (Boolean(snapshot?.length) === false){
        return { success: false, message: `${type} data not found.`};
    }
    else {
        return {
            success: true,
            ethAddress: snapshot[0]?._id,
            state: snapshot[0]?.state
        };
    }

}

export const joinThreadOnBridge  = async (type, userId, tid) =>{


    let resp = await isValidThreadId(tid);
    if(resp === true) {

        let revData = await bridgeReverseLookup(type, userId);

        if (revData?.success === true){

            let threadClient = await getClient();
            const threadId = ThreadID.fromString(process.env.TEXTILE_THREADID);
            const query = new Where("_id").eq(revData?.ethAddress);
            let snapshot = await threadClient.find(threadId, 'bridge', query);
            let bridgeData = snapshot[0];

            await threadClient.save(threadId, 'bridge', [{
                ...bridgeData,
                "state": tid,
            }]);

            return true;
        }
        else {
            return false;
        }



    }
    else {
        return false;
    }
}
