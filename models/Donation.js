import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [50, 'Name cannot be more than 50 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [100, 'Minimum donation amount is ₹100'],
    max: [100000, 'Maximum donation amount is ₹100,000']
  },
  recurring: {
    type: Boolean,
    default: false
  },
  userId: {
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

// Add a virtual for formatted date
DonationSchema.virtual('formattedDate').get(function() {
  return new Date(this.createdAt).toISOString();
});

export default mongoose.models.Donation || mongoose.model('Donation', DonationSchema);