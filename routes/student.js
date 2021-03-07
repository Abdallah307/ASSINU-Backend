const express = require('express')
const router = express.Router()
const studentController = require('../controllers/student')
const isAuth = require('../middleware/is-auth')

router.get('/info',isAuth, studentController.getStudentInfo)

module.exports = router 
