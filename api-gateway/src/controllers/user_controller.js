const axios = require('axios');

exports.proxyToUserService = async (req, res, next) => {
    try {
        const response = await axios.get(`${process.env.USER_SERVICE_URL}/users`, {
            headers: req.headers,
        });
        res.status(response.status).json(response.data);
    } catch (err) {
        next(err);
    }
};
