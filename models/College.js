import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  domain: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  } 
}, {
  timestamps: true
});

export default mongoose.models.College || mongoose.model('College', collegeSchema);