const express = require('express')
const router = express.Router();
const middleware = require('../middlewares/auth')
const msgController = require('../controllers/msg')

router.post('/send/:groupId',middleware.authenticate,msgController.postMsg)
router.get('/get',middleware.authenticate,msgController.getMsg)

module.exports = router;