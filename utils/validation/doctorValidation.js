const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./comonFilterValidation');

exports.schemaKeys = joi.object({
  name: joi.string().required(),
 
  specialization: joi.string().required(),
 availability:joi.boolean().default(false),
  averageRating: joi.number().allow(null),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);

exports.updateSchemaKeys = joi.object({
  name: joi.string(),

  specialization: joi.string(),
  availableTimes: joi.array().items(joi.object({
    start: joi.string(),
    end: joi.string()
  })),
  averageRating: joi.number(),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);

let keys = ['query', 'where'];

exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
  
      specialization: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      averageRating: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
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
