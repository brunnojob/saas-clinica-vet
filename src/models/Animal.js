const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  address: String,
  cpf: String,
});

const animalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    species: { type: String, required: true },
    registrationNumber: String,
    age: Number,
    gender: { type: String, enum: ['male', 'female'], required: true },
    weight: Number,
    color: String,
    owner: ownerSchema,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Animal', animalSchema);
