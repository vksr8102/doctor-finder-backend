const express = require("express");
const router = express.Router();
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");
const { createAppointment, findAllAppointment, getAppointment, deleteAppointment, updateAppointment } = require("../../../controller/userapp/v1/appointment");


router.post('/create',auth(PLATFORM.USERAPP),createAppointment);
router.post('/list',auth(PLATFORM.USERAPP), findAllAppointment);
router.get('/get/:id',auth(PLATFORM.USERAPP), getAppointment);
router.put('/update/:id',auth(PLATFORM.USERAPP),updateAppointment);
router.delete('/delete/:id',auth(PLATFORM.USERAPP),deleteAppointment);

module.exports = router;


