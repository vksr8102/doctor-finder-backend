 const Doctor = require('../../model/doctor');
const dbService = require('../../utils/dbServices');
const { validateParamsWithJoi } = require('../../utils/validateRequest');
const doctorSchemaKey = require('../../utils/validation/doctorValidation');
const ObjectId = require('mongodb').ObjectId;


/**
 * @description : create document of Doctor in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Doctor. {status, message, data}
 */

const createDoctor = async (req, res) => {
  try {
    let validateRequest = doctorSchemaKey.schemaKeys(req.body, doctorSchemaKey.createSchema);
    if (!validateRequest.isValid) {
      return res.validationError({ message: validateRequest.message });
    }

    let newDoctor = await dbService.create(Doctor, req.body);
    return res.success({ data: newDoctor, message: "Doctor created successfully" });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find document of Doctor by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from collection.
 * @return {Object} : found Doctor. {status, message, data}
 */
const getDoctor = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message: 'Invalid ObjectId.' });
    }

    let query = { _id: req.params.id };
    let foundDoctor = await dbService.findOne(Doctor, query);
    if (!foundDoctor) {
      return res.recordNotFound();
    }
    return res.success({ data: foundDoctor });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : update document of Doctor with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Doctor.
 * @return {Object} : updated Doctor. {status, message, data}
 */
const updateDoctor = async (req, res) => {
   try {
      let dataToUpdate = {
        ...req.body,
        updatedBy:req.user.id,
      };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        doctorSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
      }
      const query = { _id:req.params.id };
      let updatedDoctor = await dbService.updateOne(Doctor,query,dataToUpdate);
      if (!updatedDoctor){
        return res.recordNotFound();
      }
      return res.success({ data :updatedDoctor });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
};

/**
 * @description : deactivate document of Doctor by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Doctor.
 * @return {Object} : deactivated Doctor. {status, message, data}
 */
const softDeleteDoctor = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
   

    const query = { _id: req.params.id };
    const updateBody = { isDeleted: true, isActive: false };
    let updatedDoctor = await dbService.updateOne(Doctor, query, updateBody);
    if (!updatedDoctor) {
      return res.recordNotFound();
    }
    return res.success({ data: updatedDoctor });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : delete document of Doctor by id.
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Doctor. {status, message, data}
 */
const deleteDoctor = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    const query = { _id: req.params.id };
    const deletedDoctor = await dbService.deleteOne(Doctor, query);
    if (!deletedDoctor) {
      return res.recordNotFound();
    }
    return res.success({ data: deletedDoctor });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

/**
 * @description : find all documents of Doctor from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options: {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Doctor(s). {status, message, data}
 */
const findAllDoctor = async (req, res) => {
   try {
      let options = {};
      let query = {};
      let validateRequest = validateParamsWithJoi(
        req.body,
        doctorSchemaKey.findFilterKeys,
        Doctor.schema.obj
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `${validateRequest.message}` });
      }
      if (typeof req.body.query === 'object' && req.body.query !== null) {
        query = { ...req.body.query };
      }
      if (req.body.isCountOnly){
        let totalRecords = await dbService.count(Doctor, query);
        return res.success({ data: { totalRecords } });
      }
      if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
        options = { ...req.body.options };
      }
      let foundDoctors = await dbService.paginate( Doctor,query,options);
      if (!foundDoctors || !foundDoctors.data || !foundDoctors.data.length){
        return res.recordNotFound(); 
      }
      return res.success({ data :foundDoctors });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
};


/**
 * @description : create multiple documents of Doctor in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Doctors. {status, message, data}
 */
const bulkInsertDoctor = async (req,res)=>{
    try {
      if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
        return res.badRequest();
      }
      let dataToCreate = [ ...req.body.data ];
      for (let i = 0;i < dataToCreate.length;i++){
        dataToCreate[i] = {
          ...dataToCreate[i],
          addedBy: req.user.id
        };
      }
      let createdDoctors = await dbService.create(Doctor,dataToCreate);
      createdDoctors = { count: createdDoctors ? createdDoctors.length : 0 };
      return res.success({ data:{ count:createdDoctors.count || 0 } });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };
module.exports = {
createDoctor,
getDoctor,
findAllDoctor,
updateDoctor,
deleteDoctor,
softDeleteDoctor,
bulkInsertDoctor
};
