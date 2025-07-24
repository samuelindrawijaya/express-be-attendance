const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10000, 
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT'
    }
});

const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300000, 
    message: {
        success: false,
        message: 'Too many requests. Please slow down.',
        code: 'RATE_LIMIT'
    }
});

module.exports = {
    authLimiter,
    generalLimiter
};
