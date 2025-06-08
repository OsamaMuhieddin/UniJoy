const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  stripeSessionId: { type: String }, // Stripe checkout session ID
  stripePaymentIntentId: { type: String }, // Stripe PaymentIntent ID (after payment success)
  amount: { type: Number, required: true }, // Payment amount in cents or dollars (consistent)
  status: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending',
  }, // Payment status
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
