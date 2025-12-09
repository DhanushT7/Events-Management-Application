import FeedbackTemplatePreset from '../models/feedbackTemplatePresetModel.js';
import defaultFeedbackTemplate from '../config/defaultFeedbackTemplate.js';

const deepClone = (data) => JSON.parse(JSON.stringify(data));

export const ensureDefaultFeedbackTemplate = async () => {
  try {
    const { name, version, description, questions } = defaultFeedbackTemplate;
    const existing = await FeedbackTemplatePreset.findOne({ name });

    if (!existing || existing.version !== version || !Array.isArray(existing.questions) || existing.questions.length === 0) {
      await FeedbackTemplatePreset.findOneAndUpdate(
        { name },
        { name, version, description, questions },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      if (existing && existing.version !== version) {
        console.log(`⚙️  Default feedback template upgraded to v${version}`);
      }
    }
  } catch (error) {
    console.error('Failed to ensure default feedback template:', error.message);
  }
};

export const getDefaultTemplateQuestions = async () => {
  await ensureDefaultFeedbackTemplate();
  const preset = await FeedbackTemplatePreset.findOne({ name: defaultFeedbackTemplate.name });
  return deepClone(preset?.questions || defaultFeedbackTemplate.questions);
};

export const ensureEventHasTemplate = async (eventDoc) => {
  if (!eventDoc) return [];
  const hasTemplate = Array.isArray(eventDoc.feedbackTemplate) && eventDoc.feedbackTemplate.length > 0;
  if (!hasTemplate) {
    const defaultQuestions = await getDefaultTemplateQuestions();
    eventDoc.feedbackTemplate = defaultQuestions;
    await eventDoc.save();
    return deepClone(defaultQuestions);
  }
  return deepClone(eventDoc.feedbackTemplate);
};
