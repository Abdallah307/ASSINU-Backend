const express = require('express')
const router = express.Router()

const najahApiController = require('../controllers/najahApiController')
const isAuth = require('../middleware/is-auth')

router.get('/department/students/:departmentId/members', isAuth, najahApiController.getStudentsDepartmentGroupMembers)
router.get('/allstudents',isAuth, najahApiController.getAllStudents)
router.get('/department/:departmentId/all/members', isAuth, najahApiController.getDepartmentAllMembers)
module.exports = router