import mongoose from 'mongoose';

const LiveSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  speaker: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  description: { type: String },
}, { timestamps: true });

export default mongoose.models.LiveSession || mongoose.model('LiveSession', LiveSessionSchema);
