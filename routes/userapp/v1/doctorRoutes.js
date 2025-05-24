const express = require("express");
const router = express.Router();
const auth = require("../../../middleware/auth");
const { findAllDoctor, getDoctor } = require("../../../controller/userapp/v1/doctor");

router.post('/list', findAllDoctor);
router.get('/get/:id', getDoctor);

module.exports = router;


