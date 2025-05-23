const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const idValidator = require('mongoose-id-validator');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  locality: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  zipcode: { type: Number },
  createdBy: { ref: 'user', type: Schema.Types.ObjectId },
  updatedBy: { ref: 'user', type: Schema.Types.ObjectId },
  isActive: { type: Boolean },
  isDeleted: { type: Boolean }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

addressSchema.plugin(mongoosePaginate);
addressSchema.plugin(idValidator);
addressSchema.plugin(uniqueValidator, { message: 'Expected {VALUE} to be unique.' });

module.exports = mongoose.model('address', addressSchema);
