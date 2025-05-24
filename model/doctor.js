const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const idValidator = require("mongoose-id-validator");

const Schema = mongoose.Schema;

const myCustomLabels = {
  totalDocs: 'itemCount',
  docs: 'data',
  limit: 'perPage',
  page: 'currentPage',
  nextPage: 'next',
  prevPage: 'prev',
  totalPages: 'pageCount',
  pagingCounter: 'slNo',
  meta: 'paginator'
};

mongoosePaginate.paginate.options = { customLabels: myCustomLabels };

const timeSlotSchema = new Schema({
  startTime: String,
  endTime: String,
  day: String,
  isAvailable: Boolean
});

const doctorSchema = new Schema({
  name: String, 
  totalExperience: Number,
  specialization: String,
  dateOfBirth: Date,
  city: String,
  email: String,
  mobile: String,
  averageRating: Number,
  availability: Boolean,
  availableTimeSlots: [timeSlotSchema],
  createdBy: { ref: 'user', type: Schema.Types.ObjectId },
  updatedBy: { ref: 'user', type: Schema.Types.ObjectId },
  isActive: Boolean,
  isDeleted: Boolean
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});


doctorSchema.method('toJSON', function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;

  if (object.dateOfBirth) {
    object.dateOfBirth = object.dateOfBirth.toISOString().split('T')[0];
  }

  return object;
});

doctorSchema.plugin(mongoosePaginate);
doctorSchema.plugin(idValidator);

module.exports = mongoose.model('doctor', doctorSchema);
