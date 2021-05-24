const router = require("express").Router();

const sharingCenterController = require("../../controllers/newControllers/sharingCenterController");
const isAuth = require("../../middleware/is-auth");

router.get('/department/:departmentId/shareditems',isAuth, sharingCenterController.getDepartmentSharedItems) //done
router.get('/public/sharedItems',isAuth, sharingCenterController.getPublicSharedItems) //done
router.get('/user/shareditems',isAuth, sharingCenterController.getUserSharedItems) //done
router.get('/department/:departmentId/search',isAuth, sharingCenterController.searchDepartmentSharedItems) //done
router.get('/public/search',isAuth, sharingCenterController.searchPublicSharedItems) // done
router.get('/myrequests',isAuth, sharingCenterController.getMyItemsRequests)
router.get('/othersrequests',isAuth, sharingCenterController.getOthersItemsRequests)
router.get('/requests/:requestId/replays', sharingCenterController.getRequestReplays)
router.post('/shareitem',isAuth, sharingCenterController.shareItem) //done
router.post('/requestitem',isAuth, sharingCenterController.requestItemFromOwner) //no
router.post('/requests/replay',isAuth, sharingCenterController.replayToItemRequest) // no
router.put('/reserveitem',isAuth, sharingCenterController.markItemAsReserved) // no
router.put('/unreserveitem',isAuth, sharingCenterController.markItemAsUnReserved) // no

module.exports = router;
