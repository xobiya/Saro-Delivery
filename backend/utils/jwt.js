const jwt = require('jsonwebtoken');

const generateTokenForUser = (user) => {
    const id = user?._id || user?.id;
    const tokenVersion = typeof user?.tokenVersion === 'number' ? user.tokenVersion : 0;

    return jwt.sign(
        { id, tv: tokenVersion },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

module.exports = {
    generateTokenForUser,
};
