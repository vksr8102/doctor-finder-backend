const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./comonFilterValidation');

exports.schemaKeys = joi.object({
  doctorId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  appointmentId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  ratingValue: joi.number().min(1).max(5).required(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);

exports.updateSchemaKeys = joi.object({
  doctorId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  appointmentId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  ratingValue: joi.number().min(1).max(5),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);

let keys = ['query', 'where'];

exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      doctorId: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
     appointmentId: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      ratingValue: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
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
