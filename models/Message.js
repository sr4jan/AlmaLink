import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  content: String,
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sending'
  },
  attachments: [{
    url: String,
    type: String,
    name: String
  }]
})

export default mongoose.models.Message || mongoose.model('Message', messageSchema)