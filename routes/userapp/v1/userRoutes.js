const express = require("express");
const router = express.Router();
const userController = require("../../../controller/userapp/v1/userController");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");

router.get('/me',auth(PLATFORM.USERAPP), userController.getLoggedInUserInfo);


module.exports = router;


