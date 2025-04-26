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
  createdAt: {
    type: Date,
    default: Date.now
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
    type: [{
      text: String,
      postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  category: {
    type: String,
    default: 'Pending'
  }
});

export default mongoose.models.Question || mongoose.model('Question', questionSchema);