const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal',
      required: true,
    },
    veterinarianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ['consultation', 'vaccination', 'surgery', 'exam', 'follow-up'],
      required: true,
    },
    description: { type: String, required: true },
    diagnosis: String,
    treatment: String,
    medications: [String],
    nextAppointment: Date,
    cost: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Appointment', appointmentSchema);
