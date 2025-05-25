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
  appointmentDate: {
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

// Helper function to convert "hh:mm AM/PM" -> minutes
const timeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Pre-save check for overlapping appointments
appointmentSchema.pre('save', async function(next) {
  const appointment = this;

  const newStart = timeToMinutes(appointment.startTime);
  const newEnd = timeToMinutes(appointment.endTime);

  const existingAppointments = await mongoose.model("appointment").find({
    doctorId: appointment.doctorId,
    appointmentDate: appointment.appointmentDate,
    status: { $ne: "Cancelled" },
    _id: { $ne: appointment._id }
  });

  const hasOverlap = existingAppointments.some(existing => {
    const existingStart = timeToMinutes(existing.startTime);
    const existingEnd = timeToMinutes(existing.endTime);
    return newStart < existingEnd && newEnd > existingStart;
  });

  if (hasOverlap) {
    const err = new Error('Time slot already booked or overlapping with another appointment');
    return next(err);
  }

  next();
});


appointmentSchema.virtual('timeSlot').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});


appointmentSchema.statics.checkAvailability = async function(doctorId, appointmentDate, startTime, endTime, excludeId = null) {
  const query = {
    doctorId,
    appointmentDate,
    status: { $ne: "Cancelled" },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  };

  if (excludeId) query._id = { $ne: excludeId };

  const existing = await this.findOne(query);
  return !existing;
};

// Static method to update expired appointments
appointmentSchema.statics.updateExpiredAppointments = async function () {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const today = new Date(now.toISOString().split('T')[0]);

  const appointments = await this.find({
    appointmentDate: { $lte: today },
    status: { $in: ['Scheduled', 'Rescheduled'] },
    isDeleted: false,
  });

  const updates = [];

  for (const appt of appointments) {
    const apptDate = new Date(appt.appointmentDate);
    const apptEndMinutes = timeToMinutes(appt.endTime);

    if (
      apptDate < today || 
      (apptDate.getTime() === today.getTime() && apptEndMinutes <= currentMinutes)
    ) {
      updates.push(this.updateOne({ _id: appt._id }, { $set: { status: 'Completed' } }));
    }
  }

  await Promise.all(updates);
};


appointmentSchema.plugin(mongoosePaginate);
appointmentSchema.plugin(idValidator);
appointmentSchema.plugin(uniqueValidator, { message: "Expected {VALUE} to be unique." });

module.exports = mongoose.model("appointment", appointmentSchema);
