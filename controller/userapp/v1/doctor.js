const Doctor = require('../../../model/doctor');
const dbService = require('../../../utils/dbServices');
const { validateParamsWithJoi } = require('../../../utils/validateRequest');
const doctorSchemaKey = require('../../../utils/validation/doctorValidation');
const ObjectId = require('mongodb').ObjectId;




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
 * @description : find all documents of Doctor from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options: {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Doctor(s). {status, message, data}
 */
const findAllDoctor = async (req, res) => {
   try {
      let options = {};
      let query = {};
      let validateRequest =validateParamsWithJoi(
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
 * @description : Get a list of unique specializations from Doctor .

 * @param {Object} res : response contains list of unique specializations.
 * @return {Object} : list of specializations. {status, message, data}
 */

const getListOfSpecializations = async (req, res) => {
  try {
    const result = await Doctor.aggregate([
      { $group: { _id: "$specialization" } },
      { $project: { _id: 0, specialization: "$_id" } }
    ]);

    const specializations = result.map(item => item.specialization);

    if (!specializations || !specializations.length) {
      return res.recordNotFound({ message: 'No specializations found.' });
    }
    return res.success({ data :specializations });
  } catch (error) {
    console.error('Error in getUniqueSpecializations:', error);
    return res.internalServerError({ message:error.message });
  }
};



module.exports = {

getDoctor,
findAllDoctor,
getListOfSpecializations

};
