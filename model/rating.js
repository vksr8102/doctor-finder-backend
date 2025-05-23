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

const ratingSchema = new Schema({
  doctorId: { type: Schema.Types.ObjectId, ref: 'doctor' },
 appointmentId: { type: Schema.Types.ObjectId, ref: 'appointment' },
  ratingValue: { type: Number },
  comment: { type: String },
  createdBy: { ref: 'user', type: Schema.Types.ObjectId },
  updatedBy: { ref: 'user', type: Schema.Types.ObjectId },
  isActive: { type: Boolean },
  isDeleted: { type: Boolean }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

ratingSchema.method('toJSON', function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  return object;
});


ratingSchema.plugin(mongoosePaginate);
ratingSchema.plugin(idValidator);

module.exports = mongoose.model('rating', ratingSchema);
