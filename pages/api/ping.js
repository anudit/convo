import withCors from "@/middlewares/withCors";


const handler = async (req, res) => {

    return res.status(200).json({
        'success': true,
        'message': 'Heyo 🚀'
    });

}

export default withCors(handler)
