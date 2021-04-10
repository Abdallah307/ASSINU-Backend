const jwt = require('jsonwebtoken')
const Student = require('../models/student')

const isAuth = (req, res, next) => {

    if (!req.get('Authorization')) {
        return res.status(401).json({
            message: "Not authenticated"
        })
    }
    const token = req.get('Authorization').split(' ')[1]

    if (!token) {
        return res.status(403).json({
            message:"must assign the token"
        })
    }

    let decodedToken = jwt.verify(token, "iamabdallahdereiaiamacomputerengineer")

    if (!decodedToken) {
        return res.status(403).json({
            message: "Authentication failed"
        })
    }

    req.userId = decodedToken.userId
    next()
}

module.exports = isAuth