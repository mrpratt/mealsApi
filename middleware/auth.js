const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers.authorization;

    if (!token) {
        return res.status(403).send("Token is reqd for authentication");
    }

    try {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } catch (error) {
        res.status(400).send("Invalid token!!");
    }
};

module.exports = verifyToken;
