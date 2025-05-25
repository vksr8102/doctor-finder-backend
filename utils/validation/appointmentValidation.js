const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./comonFilterValidation');

exports.schemaKeys = joi.object({
  doctorId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  patientId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  appointmentDate: joi.string().required(),
  status: joi.string().valid("Scheduled", "Completed", "Cancelled").default("Scheduled"),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);

exports.updateSchemaKeys = joi.object({
  doctorId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  patientId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
 appointmentDate: joi.string(),
  status: joi.string().valid("Scheduled", "Completed", "Cancelled"),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);

let keys = ['query', 'where'];

exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      doctorId: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      patientId: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      appointmentDate: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      status: joi.alternatives().try(joi.array().items(), joi.string().valid("Scheduled", "Completed", "Cancelled"), joi.object()),
      isActive: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      isDeleted: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
      id: joi.any(),
      _id: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object())
    }).unknown(true),])
  ),
  isCountOnly: isCountOnly,
  populate: joi.array().items(populate),
  select: select
}).unknown(true);
