const Address = require('../../../model/address');
const dbService = require('../../utils/dbServices');
const addressSchemaKey = require('../../../utils/validation/addressValidation');
const validation = require('../../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;


/**
 * @description : create document of Address in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Address. {status, message, data}
 */
const addAddress = async (req, res) => {
  try {
    let validateRequest = validation.validateParamsWithJoi(req.body,addressSchemaKey.schemaKeys );
    if (!validateRequest.isValid) {
      return res.validationError({ message: validateRequest.message });
    }

    let dataToCreate = { ...req.body, createdBy: req.user.id };
    let result = await dbService.create(Address, dataToCreate);
    return res.success({ data: result, message: 'Address created successfully' });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * @description : find document of Address by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from collection.
 * @return {Object} : found Address. {status, message, data}
 */
const getAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.validationError({ message: 'Invalid or missing Address ID' });
    }

    let query = { _id: id, isDeleted: { $ne: true } };
    let result = await dbService.findOne(Address, query, { populate: ['userId'] });
    if (!result) return res.recordNotFound();

    return res.success({ data: result });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * Update Address by ID
 */
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.validationError({ message: 'Invalid or missing Address ID' });
    }

    let dataToUpdate = { ...req.body, updatedBy: req.user.id };
    let validateRequest = validation.validateParamsWithJoi(dataToUpdate, addressSchemaKey.updateSchemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message: validateRequest.message });
    }

    let result = await dbService.updateOne(Address, { _id: id }, dataToUpdate);
    if (!result) return res.recordNotFound();

    return res.success({ data: result });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};





/**
 * Delete Address (Hard Delete)
 */
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.validationError({ message: 'Invalid or missing Address ID' });
    }

    let result = await dbService.deleteOne(Address, { _id: id });
    if (!result) return res.recordNotFound();

    return res.success({ data: result });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


/**
 * @description : find all documents of Address from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options: {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Address(s). {status, message, data}
 */
const findAllAddress = async (req, res) => {
  try {
    let query = {};
    let options = {};

    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      AddressSchemaKey.findFilterKeys,
      Address.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: validateRequest.message });
    }

    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query, isDeleted: false };
    }

    if (req.body.isCountOnly) {
      const totalRecords = await dbService.count(Address, query);
      return res.success({ data: { totalRecords } });
    }

    if (typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options, populate: ['AddressId', 'patientId'] };
    }
 query.userId = req.user.id;
    const result = await dbService.paginate(Address, query, options);
    if (!result || !result.data.length) {
      return res.recordNotFound();
    }

    return res.success({ data: result });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};




module.exports = {
 addAddress,
 getAddress,
 findAllAddress,
 deleteAddress,
 updateAddress
};
