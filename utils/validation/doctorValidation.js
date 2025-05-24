const joi = require('joi');
const {
  options, isCountOnly, populate, select
} = require('./comonFilterValidation');

const timeSlotSchema = joi.object({
  startTime: joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Start time must be in HH:MM format (24-hour)',
      'any.required': 'Start time is required'
    }),
  endTime: joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'End time must be in HH:MM format (24-hour)',
      'any.required': 'End time is required'
    }),
  day: joi.string()
    .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
    .required(),
  isAvailable: joi.boolean().default(true)
}).custom((value, helpers) => {
  if (value.startTime >= value.endTime) {
    return helpers.error('any.invalid');
  }
  return value;
}).messages({
  'any.invalid': 'End time must be after start time'
});

exports.schemaKeys = joi.object({
  name: joi.string().required(), 
  totalExperience: joi.number().required(),
  specialization: joi.string().required(),
  dateOfBirth: joi.date().required(),
  city: joi.string().required(),
  email: joi.string().email().required(),
  mobile: joi.string().required(),
  averageRating: joi.number().min(0).max(5).default(0),
  availability: joi.boolean().default(false),
  availableTimeSlots: joi.array().items(timeSlotSchema),
  isActive: joi.boolean().default(true),
  isDeleted: joi.boolean().default(false)
}).unknown(true);

exports.updateSchemaKeys = joi.object({
  name: joi.string(),
  totalExperience: joi.number(),
  specialization: joi.string(),
  dateOfBirth: joi.date(),
  city: joi.string(),
  email: joi.string().email(),
  mobile: joi.string(),
  averageRating: joi.number().min(0).max(5),
  availability: joi.boolean(),
  availableTimeSlots: joi.array().items(timeSlotSchema),
  isActive: joi.boolean(),
  isDeleted: joi.boolean()
}).unknown(true);

let keys = ['query', 'where'];

exports.findFilterKeys = joi.object({
  options: options,
  ...Object.fromEntries(
    keys.map(key => [key, joi.object({
      name: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()), // 👈 updated filter keys
      totalExperience: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      specialization: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      dateOfBirth: joi.alternatives().try(joi.array().items(), joi.date(), joi.object()),
      city: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      email: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      mobile: joi.alternatives().try(joi.array().items(), joi.string(), joi.object()),
      averageRating: joi.alternatives().try(joi.array().items(), joi.number(), joi.object()),
      availability: joi.alternatives().try(joi.array().items(), joi.boolean(), joi.object()),
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
