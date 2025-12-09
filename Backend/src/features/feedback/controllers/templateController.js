import asyncHandler from 'express-async-handler';
import Event from '../../../shared/models/eventModel.js';
import { v4 as uuidv4 } from 'uuid';
import { ensureEventHasTemplate } from '../../../shared/services/feedbackTemplateService.js';

export const getEventFeedbackTemplate = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId).select('feedbackTemplate feedbackTemplateLocked');
  if (!event) return res.status(404).json({ success:false, message:'Event not found' });
  const template = await ensureEventHasTemplate(event);
  res.json({ success:true, template, locked: !!event.feedbackTemplateLocked });
});

export const saveTemplate = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user?._id;
  const { questions, notes } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ success:false, message:'Event not found' });

  // Auto-lock if event started
  if (event.startDate && new Date() >= new Date(event.startDate)) {
    event.feedbackTemplateLocked = true;
  }
  if (event.feedbackTemplateLocked) {
    await event.save();
    return res.status(403).json({ success:false, message:'Template is locked and cannot be modified' });
  }

  // snapshot current version before update
  const version = {
    versionId: uuidv4(),
    template: event.feedbackTemplate || [],
    createdBy: userId || null,
    notes: notes || 'Snapshot before template update'
  };
  event.feedbackTemplateVersions = event.feedbackTemplateVersions || [];
  event.feedbackTemplateVersions.push(version);

  event.feedbackTemplate = Array.isArray(questions) ? questions : [];
  await event.save();

  res.json({ success:true, message:'Template saved', template: event.feedbackTemplate, versionId: version.versionId });
});

export const setTemplateLock = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { lock } = req.body;
  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ success:false, message:'Event not found' });

  event.feedbackTemplateLocked = !!lock;
  await event.save();
  res.json({ success:true, locked: event.feedbackTemplateLocked });
});

export const cloneTemplateFromEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { sourceEventId } = req.body;
  const userId = req.user?._id;

  const target = await Event.findById(eventId);
  const source = await Event.findById(sourceEventId);
  if (!target || !source) return res.status(404).json({ success:false, message:'Event(s) not found' });

  if (target.feedbackTemplateLocked) {
    return res.status(403).json({ success:false, message:'Target template locked' });
  }

  // snapshot current target
  target.feedbackTemplateVersions = target.feedbackTemplateVersions || [];
  target.feedbackTemplateVersions.push({
    versionId: uuidv4(),
    template: target.feedbackTemplate || [],
    createdBy: userId || null,
    notes: `Snapshot before clone from ${sourceEventId}`
  });

  target.feedbackTemplate = JSON.parse(JSON.stringify(source.feedbackTemplate || []));
  target.feedbackTemplateClonedFrom = source._id;
  await target.save();

  res.json({ success:true, message:'Cloned template', template: target.feedbackTemplate });
});

export const getTemplateVersions = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId).select('feedbackTemplateVersions feedbackTemplate feedbackTemplateLocked');
  if (!event) return res.status(404).json({ success:false, message:'Event not found' });
  const template = await ensureEventHasTemplate(event);
  res.json({ success:true, versions: event.feedbackTemplateVersions || [], current: template, currentLocked: !!event.feedbackTemplateLocked });
});

export const restoreTemplateVersion = asyncHandler(async (req, res) => {
  const { eventId, versionId } = req.params;
  const userId = req.user?._id;
  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ success:false, message:'Event not found' });

  if (event.feedbackTemplateLocked) {
    return res.status(403).json({ success:false, message:'Template is locked' });
  }

  const version = (event.feedbackTemplateVersions || []).find(v => v.versionId === versionId);
  if (!version) return res.status(404).json({ success:false, message:'Version not found' });

  // snapshot current then restore
  event.feedbackTemplateVersions.push({
    versionId: uuidv4(),
    template: event.feedbackTemplate || [],
    createdBy: userId || null,
    notes: `Snapshot before restore of ${versionId}`
  });

  event.feedbackTemplate = version.template || [];
  await event.save();

  res.json({ success:true, message:'Restored template', template: event.feedbackTemplate });
});
