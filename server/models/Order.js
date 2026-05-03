const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  table:         { type: Number, required: true },
  items: [{
    _id:      String,
    name:     String,
    price:    Number,
    quantity: Number,
    prepTime: Number
  }],
  total:          { type: Number, required: true },
  status:         { type: String, enum: ['Received','Preparing','Ready','Delivered'], default: 'Received' },
  eta:            { type: Number, required: true },
  phone:          { type: String, default: '' },
  pointsEarned:   { type: Number, default: 0 },
  paymentMethod:  { type: String, enum: ['upi','cash'], default: 'cash' },
  paymentStatus:  { type: String, enum: ['pending','paid'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
