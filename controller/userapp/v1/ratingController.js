const Rating = require('../../../model/rating');
const Appointment = require('../../../model/appointment');
const Doctor = require('../../../model/doctor');
const dbService = require('../../../utils/dbServices');
const ratingSchemaKey = require('../../../utils/validation/ratingValidation'); // adjust path as needed
const { validateParamsWithJoi } = require('../../../utils/validateRequest');

const createRating = async (req, res) => {
  try {
    const userId = req.user.id;

    const validateRequest = validateParamsWithJoi(
      { ...req.body, createdBy: userId },
      ratingSchemaKey.schemaKeys
    );

    if (!validateRequest.isValid) {
      return res.validationError({ message: validateRequest.message });
    }

    const { appointmentId, ratingValue, comment } = req.body;

    const appointment = await dbService.findOne(Appointment, { _id: appointmentId });
    if (!appointment) {
      return res.badRequest({ message: 'Appointment not found' });
    }

    const doctorId = appointment.doctorId;

    const existingRating = await dbService.findOne(Rating, { appointmentId });
    if (existingRating) {
      return res.badRequest({ message: 'Rating already exists for this appointment' });
    }

    const dataToCreate = {
      doctorId,
      appointmentId,
      ratingValue,
      comment,
      createdBy: userId,
      updatedBy: userId,
      isActive: true,
      isDeleted: false
    };

    const newRating = await dbService.create(Rating, dataToCreate);

 
    const ratings = await Rating.find({ doctorId, isDeleted: false });
    const totalRating = ratings.reduce((sum, r) => sum + r.ratingValue, ratingValue);
    const totalCount = ratings.length + 1;
    const averageRating = Number((totalRating / totalCount).toFixed(1));

    await dbService.updateOne(Doctor, { _id: doctorId }, { averageRating });

    return res.success({
      data: newRating,
      message: 'Rating submitted successfully'
    });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const getRatingByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.validationError({ message: 'Appointment ID is required' });
    }

    const rating = await dbService.findOne(Rating, {
      appointmentId,
      isDeleted: false
    });

    if (!rating) {
      return res.notFound({ message: 'Rating not found for this appointment' });
    }

    return res.success({
      data: rating,
      message: 'Rating fetched successfully'
    });

  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};


module.exports = {
  createRating,
  getRatingByAppointmentId
};
