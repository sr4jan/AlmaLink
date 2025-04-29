import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  direction: {
    type: String,
    enum: ['up', 'down'],
    required: true
  }
}, { _id: false });

const replySchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    default: 'Pending'
  },
  votes: {
    type: [voteSchema],
    default: []
  },
  voteCount: {
    type: Number,
    default: 0
  },
  replies: {
    type: [replySchema],
    default: []
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

export default mongoose.models.Question || mongoose.model('Question', questionSchema);