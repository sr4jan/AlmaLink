import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  read: {
    type: Boolean,
    default: false
  },
  attachments: [{
    url: String,
    name: String,
    type: String
  }]
}, {
  timestamps: true
});

// Ensure indexes for better query performance
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ createdAt: -1 });

// Delete check - don't create the model if it already exists
export default mongoose.models.Message || mongoose.model('Message', MessageSchema);