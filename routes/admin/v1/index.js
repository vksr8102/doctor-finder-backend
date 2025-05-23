/** 
* index.js
* @discription :: index route file for userapp platform
*/

const express = require("express");
const router = express.Router();

router.use('/admin/user',require('./userRoutes'));
router.use('/admin/doctor',require('./doctorRoutes'));


module.exports = router;