import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  upvotedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for upvotes count
ideaSchema.virtual('upvotes').get(function() {
  return this.upvotedBy?.length || 0;
});

// Ensure virtuals are included in JSON
ideaSchema.set('toJSON', { virtuals: true });
ideaSchema.set('toObject', { virtuals: true });

export default mongoose.models.Idea || mongoose.model('Idea', ideaSchema);