import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide an event date']
  },
  location: {
    type: String,
    default: 'TBA'
  },
  type: {
    type: String,
    enum: ['In-Person', 'Virtual', 'Hybrid'],
    default: 'In-Person'
  },
  category: {
    type: String,
    enum: ['tech', 'cultural', 'academic', 'sports', 'workshop', 'other'],
    default: 'other'
  },
  capacity: {
    type: Number,
    default: null
  },
  registrationLink: {
    type: String,
    required: [true, 'Please provide a registration link'],
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  organizer: {
    type: String,
    required: [true, 'Please provide an organizer name'],
    trim: true
  },
  userId: {
    type: String,
    required: [true, 'Please provide a user ID']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  attendees: {
    type: Number,
    default: 0
  }
});

// Add index for better query performance
EventSchema.index({ date: 1, category: 1, status: 1 });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);