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
  doctorId: { 
    type: Schema.Types.ObjectId, 
    ref: "doctor",  
  },
  patientId: { 
    type: Schema.Types.ObjectId, 
    ref: "user", 
  },
  date: { 
    type: Date
  },
  startTime: { 
    type: String
  },
  endTime: { 
    type: String,
  },
  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled", "Rescheduled"],
    default: "Scheduled"
  },
  medicalHistory: { 
    type: String
  },
  symptoms: { 
    type: String
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: "user" 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: "user" 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: { 
    createdAt: "createdAt", 
    updatedAt: "updatedAt" 
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


appointmentSchema.pre('save', async function(next) {
  const appointment = this;


  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const newStart = timeToMinutes(appointment.startTime);
  const newEnd = timeToMinutes(appointment.endTime);


  const overlappingAppointment = await mongoose.model("appointment").findOne({
    doctorId: appointment.doctorId,
    date: appointment.date,
    status: { $ne: "Cancelled" },
    _id: { $ne: appointment._id },
    $or: [
      { 
        $expr: { 
          $and: [
            { $lte: [{ $toInt: { $substr: ["$startTime", 0, 2] } }, newEnd] },
            { $gte: [{ $toInt: { $substr: ["$endTime", 0, 2] } }, newStart] }
          ]
        }
      }
    ]
  });

  if (overlappingAppointment) {
    const err = new Error('Time slot already booked or overlapping with another appointment');
    return next(err);
  }

  next();
});


appointmentSchema.virtual('timeSlot').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});


appointmentSchema.statics.checkAvailability = async function(doctorId, date, startTime, endTime, excludeId = null) {
  const query = {
    doctorId,
    date,
    status: { $ne: "Cancelled" },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  };

  if (excludeId) query._id = { $ne: excludeId };

  const existing = await this.findOne(query);
  return !existing;
};


appointmentSchema.plugin(mongoosePaginate);
appointmentSchema.plugin(idValidator);
appointmentSchema.plugin(uniqueValidator, { message: "Expected {VALUE} to be unique." });

module.exports = mongoose.model("appointment", appointmentSchema);