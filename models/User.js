import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true,
    enum: ['student', 'alumni', 'admin', 'superadmin'] 
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    college: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College'
      },
      name: { 
        type: String, 
        required: function() {
          return ['student', 'alumni'].includes(this.role);
        }
      },
      graduationYear: { 
        type: Number, 
        required: function() {
          return ['student', 'alumni'].includes(this.role);
        }
      },
      degree: { 
        type: String, 
        required: function() {
          return ['student', 'alumni'].includes(this.role);
        }
      },
      major: { 
        type: String, 
        required: function() {
          return ['student', 'alumni'].includes(this.role);
        }
      }
    },
    company: {
      name: String,
      position: String,
      startDate: Date,
      endDate: Date,
      current: Boolean
    },
    location: String,
    bio: String,
    skills: [String],
    experience: [{
      title: String,
      company: String,
      startDate: Date,
      endDate: Date,
      description: String,
      current: Boolean
    }],
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String
    }
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);