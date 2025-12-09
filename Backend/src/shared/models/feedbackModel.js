import mongoose from "mongoose";

// Old model commented out for reference
/*
const feedbackSchema = mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      required: true,
    },
    comments: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const feedback = mongoose.model("Feedback", feedbackSchema);
export default feedback;
*/

// Enhanced feedback model with dynamic responses
const feedbackSchema = mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Personal Information
    email: { type: String, required: true },
    name: { type: String, required: true },
    designation: { type: String, required: true },
    institute: { type: String, required: true },
    contact: { type: String, required: true },

    // Dynamic feedback responses
    responses: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // Can store strings, numbers, arrays
      required: true
    },

    // Legacy fields removed: use `responses` map for all questions

    // Overall rating (calculated from responses)
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },

    // Feedback metadata
    submissionSource: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    },

    ipAddress: {
      type: String
    },

    userAgent: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
feedbackSchema.index({ eventId: 1, participantId: 1 }, { unique: true });
feedbackSchema.index({ eventId: 1, createdAt: -1 });
feedbackSchema.index({ overallRating: 1 });

// Compute overallRating automatically from numeric rating-type responses (1–5 scale)
feedbackSchema.pre('save', function(next) {
  try {
    const resMap = this.responses || new Map();
    const numericValues = [];
    // Iterate map values and collect valid 1-5 numbers
    for (const [, v] of resMap) {
      const num = Number(v);
      if (!Number.isNaN(num) && num >= 1 && num <= 5) {
        numericValues.push(num);
      }
    }
    if (numericValues.length > 0) {
      const avg = numericValues.reduce((a,b)=>a+b,0) / numericValues.length;
      this.overallRating = Math.round(avg * 100) / 100; // keep two decimals
    }
  } catch (e) {
    // Do not block save on rating compute errors
  }
  next();
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
