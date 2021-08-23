const jwt = require('jsonwebtoken');
const config = require('./Config')
const winston = require('./Logger');
const common = require('./DbOperation');
// const winstonlog = require('./Logger');

// verify token for APIs
const verifyTokenForAPIsAccess = async (req, res, next) => {

    const ua = req.headers['user-agent'];

    const ip = await common.userInfo(req);
    // winstonlog.log.info(`[API URL]: ${req.url} [USER_AGENT]: ${ua}`);
    if (config.auth === "DISABLE") {
        next();
    } else {
        const bearerHeader = req.headers['authorization']

        if (typeof bearerHeader !== 'undefined') {
            const bearerToken = bearerHeader.split(' ')[1]
            token = bearerToken
        } else {
            res.status(403).json({ message: 'Access Denied' });
            return;
        }

        jwt.verify(token, config.apiSecretKey, (err, authData) => {
            if (err) {
                winston.logger.warn(`[${req.method}: "${req.url}"] ` + `[msg: "Someone is trying to verify API JWT from IP address: ${ip}"]`);
                res.status(403).json({ message: 'Access Denied' });
            } else { // authorization successful now move next 
                // res.json({messge: "Authorization Successfulss"});
                next();
                // winstonlog.log.info(`[API URL - AFTER NEXT()]: ${req.url} [USER_AGENT]: ${ua}`);
            }
        });
    }
}

// creating jwt for APIs access
const createTokenForAPIsAccess = async (req, res) => {
    const ip = await common.userInfo(req);
    const { pno, apiKey } = req.body;
    const user = {
        number: pno
    }
    if (apiKey === config.apiKeyFirebase) {
        jwt.sign({ user: user }, config.apiSecretKey, { expiresIn: '90d' }, (err, token1) => {
            res.json({
                token1,
            });
        });
    } else {
        winston.logger.warn(`[${req.method}: "${req.url}"] ` + `[msg: "Someone is trying to create JWT for APIs from: ${ip}"]`);
        res.json({
            message: 'Token creation failed',
        })
    }
}

// create JWT for otp
const createTokenForOTP = async (req, res) => {
    const ip = await common.userInfo(req);
    const { pno, apiKey } = req.body;
    const user = {
        pno: pno
    };

    if (apiKey === config.apiKeyFirebase) {
        jwt.sign({ user: user }, config.otpSecretKey, { expiresIn: '90d' }, (err, token) => {
            res.json({
                token,
            });
        });
    } else {
        winston.logger.warn(`[${req.method}: "${req.url}"] ` + `[msg: "Someone is trying to create JWT for OTP from: ${ip}"]`);
        res.json({
            message: 'Token creation failed',
        })
    }
}

// verify/decode jwt for otp
const verifyTokenForOTP = async (req, res) => {

    const ip = await common.userInfo(req);
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1]
        token = bearerToken;
    } else {
        res.status(403).json({ message: 'Access Denied' });
    }

    jwt.verify(token, config.otpSecretKey, (err, authData) => {
        if (err) {
            winston.logger.warn(`[${req.method}: "${req.url}"] ` + `[msg: "Someone is trying to verify OTP JWT from: ${ip}"]`);
            res.status(403).json({ message: 'Access Denied' });
        } else {
            const number = authData.user.pno;
            res.json({
                message: 'Your Data',
                number
            });
        }
    });
}


module.exports = {
    verifyTokenForOTP,
    createTokenForOTP,
    createTokenForAPIsAccess,
    verifyTokenForAPIsAccess,
}