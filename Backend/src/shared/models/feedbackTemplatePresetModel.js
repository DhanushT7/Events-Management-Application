import mongoose from 'mongoose';

const templateQuestionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['rating', 'text', 'radio', 'checkbox', 'dropdown'],
    required: true
  },
  options: [{ type: String }],
  isRequired: { type: Boolean, default: true },
  order: { type: Number, required: true },
  category: { type: String, default: 'overall' },
  multiline: { type: Boolean, default: false },
  rows: { type: Number, default: 1 },
  minRating: { type: Number, default: 1 },
  maxRating: { type: Number, default: 5 },
  placeholder: { type: String, default: '' },
  helpText: { type: String, default: '' }
}, { _id: false });

const feedbackTemplatePresetSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  version: { type: String, default: '1.0.0' },
  questions: { type: [templateQuestionSchema], default: [] }
}, { timestamps: true });

const FeedbackTemplatePreset = mongoose.model('FeedbackTemplatePreset', feedbackTemplatePresetSchema);
export default FeedbackTemplatePreset;
