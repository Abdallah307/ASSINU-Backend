const express = require('express')
const router = express.Router()

const sharingCenterController = require('../controllers/sharingCenter')
const isAuth = require('../middleware/is-auth')


router.get('/public',isAuth, sharingCenterController.getPublicSharingItems)

router.get('/public/search',isAuth, sharingCenterController.searchPublicItems)
router.get('/department/search',isAuth, sharingCenterController.searchDepartmentItems)
router.get('/department/:departmentId',isAuth, sharingCenterController.getDepartmentSharingItems)

router.get('/myitems/:userId',isAuth, sharingCenterController.fetchUserItems)

router.post('/public/shareitem',isAuth, sharingCenterController.postPublicShareditem)
router.post('/department/shareitem',isAuth, sharingCenterController.postDepartmentShareditem)

module.exports = router