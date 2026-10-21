const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['medication', 'vaccine', 'supply', 'equipment'],
      required: true,
    },
    category: String,
    quantity: { type: Number, required: true, default: 0 },
    minQuantity: { type: Number, default: 0 },
    unit: { type: String, required: true },
    expirationDate: Date,
    cost: { type: Number, required: true },
    supplier: String,
    location: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
