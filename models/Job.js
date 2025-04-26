import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  requirements: {
    type: String,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  userId: {
    type: String,
    required: true,
    default: 'sr4jan'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add a virtual for formatted date
JobSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toISOString();
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema);