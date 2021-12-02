import { addressToThreadIds } from "@/lib/thread-db";
import withApikey from "@/middlewares/withApikey";
import { isBlockchainAddress } from '@/utils/stringUtils';

const handler = async(req, res) => {

  try {

    let {address} = req.query;

    if (isBlockchainAddress(address) === true){
        let resp = await addressToThreadIds(address);

        if (resp.length > 0) {
          return res.status(200).json({...resp[0], success: true});
        }
        else {
          return res.status(200).json({});
        }
    }
    else {
        return res.status(400).json({
            success: false,
            'error':'Invalid commentId.'
        });
    }

  } catch (error) {
    return res.status(500).json({ 'success': false, error });
  }
}

export default withApikey(handler)
