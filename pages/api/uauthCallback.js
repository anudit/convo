export default async (req, res) => {

    console.log('query', req.query);
    console.log('body', req.body);

    return res.status(200).json({
        'success': true,
        'message': 'Heyo 🚀'
    });

}
