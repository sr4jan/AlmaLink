import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    registrationLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
