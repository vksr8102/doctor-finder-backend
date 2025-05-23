const Appointment = require('../../../model/appointment');
const dbService = require('../../../utils/dbServices');
const appointmentSchemaKey = require('../../../utils/validation/appointmentValidation');
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;



/**
 * @description : create document of Appointment in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Appointment. {status, message, data}
 */
const createAppointment = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body, 
      appointmentSchemaKey.schemaKeys
    );
    
    if (!validateRequest.isValid) {
      return res.validationError({ message: validateRequest.message });
    }

    const { doctorId, appointmentDate } = req.body;
    const isAvailable = await Appointment.checkAvailability(
      doctorId,
      req.user.id,
      appointmentDate
    );

    if (!isAvailable) {
      return res.BadRequest({ 
        message: 'Either the slot is already booked or not available' 
      });
    }

   
    if (new Date(appointmentDate) <= new Date()) {
      return res.validationError({ 
        message: 'Appointment date must be in the future' 
      });
    }

  
    const dataToCreate = { 
      ...req.body,
       patientId:req.user.id,
      createdBy: req.user.id,
      isActive: true,
      isDeleted: false
    };

    const result = await dbService.create(Appointment, dataToCreate);

    return res.success({ 
      data: result, 
      message: 'Appointment booked successfully' 
    });

  } catch (error) {
   
    
    return res.internalServerError({ 
      message: 'Failed to book appointment. Please try again later.' 
    });
  }
};


/**
 * @description : find document of Appointment by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from collection.
 * @return {Object} : found Appointment. {status, message, data}
 */
const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.validationError({ message: 'Invalid or missing appointment ID' });
    }

    let query = { _id: id, isDeleted: { $ne: true } };
    let result = await dbService.findOne(Appointment, query, { populate: ['doctorId', 'patientId'] });
    if (!result) return res.recordNotFound();

    return res.success({ data: result });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * Update Appointment by ID
 */
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.validationError({ message: 'Invalid or missing appointment ID' });
    }

    let dataToUpdate = { ...req.body, updatedBy: req.user.id };
    let validateRequest = validation.validateParamsWithJoi(dataToUpdate, appointmentSchemaKey.updateSchemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: validateRequest.message });
    }

    let result = await dbService.updateOne(Appointment, { _id: id }, dataToUpdate);
    if (!result) return res.recordNotFound();

    return res.success({ data: result });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};





/**
 * Delete Appointment (Hard Delete)
 */
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.validationError({ message: 'Invalid or missing appointment ID' });
    }

    let result = await dbService.deleteOne(Appointment, { _id: id });
    if (!result) return res.recordNotFound();

    return res.success({ data: result });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * @description : find all documents of Appointment from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options: {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Appointment(s). {status, message, data}
 */
const findAllAppointment = async (req, res) => {
  try {
    let query = {};
    let options = {};

    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      appointmentSchemaKey.findFilterKeys,
      Appointment.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: validateRequest.message });
    }

    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query, isDeleted: false };
    }

    if (req.body.isCountOnly) {
      const totalRecords = await dbService.count(Appointment, query);
      return res.success({ data: { totalRecords } });
    }

    if (typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options, populate: ['doctorId', 'patientId'] };
    }
 query.userId = req.user.id;
    const result = await dbService.paginate(Appointment, query, options);
    if (!result || !result.data.length) {
      return res.recordNotFound();
    }

    return res.success({ data: result });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};




module.exports = {
  createAppointment,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  findAllAppointment,
};
