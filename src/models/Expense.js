const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ['medication', 'procedure', 'exam', 'supply', 'other'],
      required: true,
    },
    receipt: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Expense', expenseSchema);
