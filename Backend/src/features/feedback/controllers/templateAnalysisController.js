import asyncHandler from 'express-async-handler';
import Event from '../../../shared/models/eventModel.js';
import Feedback from '../../../shared/models/feedbackModel.js';

export const getTemplateAnalysis = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId).select('feedbackTemplate');
  if (!event) return res.status(404).json({ success:false, message:'Event not found' });

  const feedbacks = await Feedback.find({ eventId });
  const template = event.feedbackTemplate || [];
  const questionAnalysis = {};

  for (const q of template) {
    const qid = q.questionId || q.order || q.questionText;
    if (q.questionType === 'rating') {
      const ratings = feedbacks
        .map(f => f.responses?.[qid])
        .filter(x => x !== undefined && x !== null)
        .map(Number)
        .filter(x => !Number.isNaN(x));
      const avg = ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0;
      const distribution = {};
      for (let i=1;i<=5;i++) distribution[i] = ratings.filter(r => r === i).length;
      questionAnalysis[qid] = { questionText: q.questionText, type:'rating', average: avg, distribution, totalResponses: ratings.length };
    } else if (q.questionType === 'radio' || q.questionType === 'dropdown') {
      const answers = feedbacks.map(f => f.responses?.[qid]).filter(Boolean);
      const distribution = {};
      for (const a of answers) distribution[a] = (distribution[a]||0)+1;
      questionAnalysis[qid] = { questionText: q.questionText, type: q.questionType, distribution, totalResponses: answers.length };
    } else if (q.questionType === 'text') {
      const answers = feedbacks.map(f => f.responses?.[qid]).filter(x => typeof x === 'string' && x.trim().length > 0);
      questionAnalysis[qid] = { questionText: q.questionText, type:'text', responses: answers, count: answers.length };
    } else if (q.questionType === 'checkbox') {
      const answers = feedbacks.map(f => f.responses?.[qid]).filter(Boolean).flat();
      const distribution = {};
      for (const a of answers) distribution[a] = (distribution[a]||0)+1;
      questionAnalysis[qid] = { questionText: q.questionText, type:'checkbox', distribution, totalSelections: answers.length };
    }
  }

  res.json({ success:true, questionAnalysis });
});
