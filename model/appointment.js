const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const idValidator = require("mongoose-id-validator");
const uniqueValidator = require("mongoose-unique-validator");

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

const appointmentSchema = new Schema({
  doctorId: { type: Schema.Types.ObjectId, ref: "doctor", required: true },
  patientId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  appointmentDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled"
  },
  createdBy: { ref: "user", type: Schema.Types.ObjectId },
  updatedBy: { ref: "user", type: Schema.Types.ObjectId },
  isActive: { type: Boolean },
  isDeleted: { type: Boolean }
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
});


appointmentSchema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  return object;
});


appointmentSchema.plugin(mongoosePaginate);
appointmentSchema.plugin(idValidator);
appointmentSchema.plugin(uniqueValidator, {
  message: "Expected {VALUE} to be unique."
});

module.exports = mongoose.model("appointment", appointmentSchema);
