// import asyncHandler from "express-async-handler";

// export const dashboard = asyncHandler(async(req, res)=>{
  
// });

import asyncHandler from "express-async-handler";
import Event from "../../models/eventModel.js";
import ParticipantEvent from "../../models/ParticipantEventModel.js";
import Feedback from "../../models/feedbackModel.js";
import mongoose from "mongoose";

// Get all events
export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Register for an event
export const registerEvent = asyncHandler(async (req, res) => {
  const { participantId, eventId } = req.body;
  const exists = await ParticipantEvent.findOne({ participantId, eventId });
  if (exists) {
    res.status(400).json({ message: "Already registered" });
    return;
  }
  const registration = await ParticipantEvent.create({ participantId, eventId, attended: false, feedbackGiven: false });
  res.status(201).json(registration);
});

// Get participant's events
export const getMyEvents = asyncHandler(async (req, res) => {
  const { participantId } = req.params;
  const myEvents = await ParticipantEvent.find({ participantId })
    .populate("eventId")
    .populate("participantId");
  res.json(myEvents);
});

// Get participant's certificates (assuming certificates are part of ParticipantEvent)
export const getMyCertificates = async (req, res) => {
  try {
    const { participantId } = req.params;

    // Find all events where participant attended and gave feedback
    const eligible = await ParticipantEvent.find({
      participantId,
      attended: true, 
      feedbackGiven: true
    }).populate("eventId");

    // Map to clean response
    const certificates = eligible.map(record => ({
      eventId: record.eventId._id,
      title: record.eventId.title,
      startDate: record.eventId.startDate,
      endDate: record.eventId.endDate
    }));

    res.status(200).json(certificates);

  } catch (err) {
    console.error("Error fetching certificates:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Submit feedback
export const giveFeedback = asyncHandler(async (req, res) => {
  try {
    // Destructure all fields expected by the feedback model
    const {
      participantId, eventId, email, name, designation, institute, contact,
      q7, q8, q9, q10, q11, q12, q13, q14, q15
    } = req.body;
    console.log("Received participantId:", participantId, "eventId:", eventId);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(participantId) || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid participantId or eventId" });
    }

    // Create feedback with all fields
    const feedback = await Feedback.create({
      participantId, eventId, email, name, designation, institute, contact,
      q7, q8, q9, q10, q11, q12, q13, q14, q15
    });
    await ParticipantEvent.findOneAndUpdate({ participantId, eventId }, { feedbackGiven: true });
    res.status(201).json(feedback);
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(400).json({ message: err.message || "Failed to submit feedback" });
  }
});