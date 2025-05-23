const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./comonFilterValidation');

exports.schemaKeys = joi.object({
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  addressLine1: joi.string().required(),
  addressLine2: joi.string().allow(null, ''),
  city: joi.string().required(),
  state: joi.string().required(),
  country: joi.string().required(),
  postalCode: joi.string().allow(null, ''),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);

exports.updateSchemaKeys = joi.object({
  userId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  addressLine1: joi.string(),
  addressLine2: joi.string().allow(null, ''),
  city: joi.string(),
  state: joi.string(),
  country: joi.string(),
  postalCode: joi.string().allow(null, ''),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);

let keys = ['query', 'where'];

exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      userId: joi.alternatives().try(joi.array().items(), joi.string().regex(/^[0-9a-fA-F]{24}$/), joi.object()),
      addressLine1: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      addressLine2: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      city: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      state: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      country: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      postalCode: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
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
