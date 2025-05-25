const express = require("express");
const router = express.Router();
const auth = require("../../../middleware/auth");
const { findAllDoctor, getDoctor, getListOfSpecializations } = require("../../../controller/userapp/v1/doctor");

router.post('/list', findAllDoctor);
router.get('/get/:id', getDoctor);
router.get('/get-specializations',getListOfSpecializations)

module.exports = router;


