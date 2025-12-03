import mongoose from "mongoose";

const noteOrderSchema = mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // Income sources with calculated values
    income: [
      {
        category: String,
        expectedParticipants: Number,
        perParticipantAmount: Number,
        gstPercentage: { type: Number, default: 0 },
        income: Number, // Calculated: (participants * amount) * (1 - gst/100)
      },
    ],

    // Planned expenses
    expenses: [
      {
        category: String,
        amount: Number,
      },
    ],

    // Calculated totals
    totalIncome: Number,
    totalExpenditure: Number,
    universityOverhead: Number, // 30% of totalIncome

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

const NoteOrder = mongoose.model("NoteOrder", noteOrderSchema);
export default NoteOrder;