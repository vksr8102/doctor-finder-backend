const express = require("express");
const router = express.Router();
const doctorController = require("../../../controller/admin/doctor");
const {PLATFORM} = require("../../../constants/authConstant");
const auth = require("../../../middleware/auth");


router.post('/create',auth(PLATFORM.ADMIN),doctorController.createDoctor);
router.post('/addBulk',auth(PLATFORM.ADMIN),doctorController.bulkInsertDoctor);
router.post('/list',auth(PLATFORM.ADMIN), doctorController.findAllDoctor);
router.get('/get/:id',auth(PLATFORM.ADMIN), doctorController.getDoctor);
router.put('/update/:id',auth(PLATFORM.ADMIN), doctorController.updateDoctor);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), doctorController.softDeleteDoctor);
router.delete('/delete/:id',auth(PLATFORM.ADMIN),doctorController.deleteDoctor);

module.exports = router;


