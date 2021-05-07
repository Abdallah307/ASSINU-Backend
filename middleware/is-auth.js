const jwt = require('jsonwebtoken')
const User = require('../models/User')
const errorCreator = require('../errorCreator')

const isAuth = (req, res, next) => {

    try {
        if (!req.get('Authorization')) {
            return res.status(401).json({
                message: "Not Authenticated"
            })
        }
    
        const token = req.get('Authorization').split(' ')[1]
    
        if (!token) {
            return res.status(401).json({
                message:"Not Authenticated"
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
    catch(err) {
        console.log(err)
        const error = errorCreator(err.message, 500)
        return next(error)
    }

    
}

module.exports = isAuth