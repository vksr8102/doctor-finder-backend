/** 
* index.js
* @discription :: index route file for userapp platform
*/

const express = require("express");
const router = express.Router();

router.use('/userapp/auth', require("./auth"));
router.use('/userapp/user',require('./userRoutes'));
router.use('/userapp/doctor',require('./doctorRoutes'));
router.use('/userapp/appointment',require('./AppointmentRoutes'));



module.exports = router;