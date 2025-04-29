import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 100,
    max: 100000
  },
  recurring: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    required: true,
    enum: ['infrastructure', 'library', 'equipment', 'scholarship']
  },
  paymentId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.models.Donation || mongoose.model('Donation', DonationSchema);