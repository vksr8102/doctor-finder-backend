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

const doctorSchema = new Schema({
  name: { type: String },
  specialization: { type: String },
  availability: {type:Boolean,default:false},
  averageRating: { type: Number, default: 0 },
  createdBy: { ref: 'user', type: Schema.Types.ObjectId },
  updatedBy: { ref: 'user', type: Schema.Types.ObjectId },
  isActive: { type: Boolean },
  isDeleted: { type: Boolean }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

doctorSchema.method('toJSON', function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  return object;
});

doctorSchema.plugin(mongoosePaginate);
doctorSchema.plugin(idValidator);

module.exports = mongoose.model('doctor', doctorSchema);
