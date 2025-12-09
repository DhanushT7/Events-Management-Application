import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, TextField, Select, MenuItem, Checkbox, FormControlLabel, Chip, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const defaultQuestion = () => ({
  questionId: uuidv4(),
  questionText: '',
  questionType: 'text',
  options: [],
  isRequired: true,
  order: 0
});

const notify = (message, variant = 'info') => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('app:notify', { detail: { message, options: { variant } } }));
};

export default function CoordinatorEventTemplate({ eventId, token, onCloned }) {
  const [template, setTemplate] = useState([]);
  const [locked, setLocked] = useState(false);
  const [sourceEventId, setSourceEventId] = useState('');
  const [versions, setVersions] = useState([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lockUpdating, setLockUpdating] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchTemplate = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${API}/coordinator/template/${eventId}`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to load template');
      const data = await res.json();
      const ordered = (data.template || []).map((q, idx) => ({ ...q, order: q.order || idx + 1 }));
      setTemplate(ordered);
      setLocked(!!data.locked);
    } catch (error) {
      notify(error.message || 'Unable to fetch template', 'error');
    }
  };

  const fetchVersions = async () => {
    if (!eventId) return;
    setVersionsLoading(true);
    try {
      const res = await fetch(`${API}/coordinator/template/${eventId}/versions`, { headers: authHeader });
      if (!res.ok) throw new Error('Failed to load versions');
      const data = await res.json();
      setVersions(data.versions || []);
    } catch (error) {
      notify(error.message || 'Unable to load versions', 'error');
    } finally {
      setVersionsLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchTemplate();
      fetchVersions();
    }
  }, [eventId]);

  const addQuestion = () => {
    const next = [...template, { ...defaultQuestion(), order: template.length + 1 }];
    setTemplate(next);
  };

  const removeQuestion = (qid) => {
    const next = template.filter(q => q.questionId !== qid).map((q, idx) => ({ ...q, order: idx + 1 }));
    setTemplate(next);
  };

  const duplicateQuestion = (qid) => {
    const idx = template.findIndex(q => q.questionId === qid);
    if (idx >= 0) {
      const copy = { ...template[idx], questionId: uuidv4(), order: template.length + 1 };
      setTemplate([...template, copy]);
    }
  };

  const updateField = (qid, field, value) => {
    setTemplate(t => t.map(q => q.questionId === qid ? { ...q, [field]: value } : q));
  };

  const addOption = (qid) => {
    setTemplate(t => t.map(q => q.questionId === qid ? { ...q, options: [...(q.options||[]), ''] } : q));
  };

  const updateOption = (qid, idx, value) => {
    setTemplate(t => t.map(q => {
      if (q.questionId !== qid) return q;
      const opts = [...(q.options || [])];
      opts[idx] = value;
      return { ...q, options: opts };
    }));
  };

  const removeOption = (qid, idx) => {
    setTemplate(t => t.map(q => {
      if (q.questionId !== qid) return q;
      const opts = [...(q.options || [])];
      opts.splice(idx, 1);
      return { ...q, options: opts };
    }));
  };

  const moveQuestion = (qid, dir) => {
    const idx = template.findIndex(q => q.questionId === qid);
    if (idx < 0) return;
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= template.length) return;
    const next = [...template];
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    setTemplate(next.map((q, i) => ({ ...q, order: i + 1 })));
  };

  const saveTemplate = async () => {
    if (locked) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/coordinator/template/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ questions: template, notes: 'Coordinator UI save' })
      });
      if (!res.ok) throw new Error('Failed to save template');
      notify('Template saved successfully', 'success');
      await Promise.all([fetchTemplate(), fetchVersions()]);
    } catch (error) {
      notify(error.message || 'Unable to save template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleLock = async () => {
    setLockUpdating(true);
    try {
      const res = await fetch(`${API}/coordinator/template/${eventId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ lock: !locked })
      });
      if (!res.ok) throw new Error('Failed to update lock state');
      setLocked(!locked);
      notify(!locked ? 'Template locked' : 'Template unlocked', 'info');
    } catch (error) {
      notify(error.message || 'Unable to change lock state', 'error');
    } finally {
      setLockUpdating(false);
    }
  };

  const cloneFrom = async () => {
    if (!sourceEventId) return;
    setCloning(true);
    try {
      const res = await fetch(`${API}/coordinator/template/${eventId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ sourceEventId })
      });
      if (!res.ok) throw new Error('Failed to clone template');
      notify('Template cloned successfully', 'success');
      await Promise.all([fetchTemplate(), fetchVersions()]);
      onCloned && onCloned();
    } catch (error) {
      notify(error.message || 'Unable to clone template', 'error');
    } finally {
      setCloning(false);
    }
  };

  const restoreVersion = async (versionId) => {
    if (!versionId) return;
    setRestoringId(versionId);
    try {
      const res = await fetch(`${API}/coordinator/template/${eventId}/versions/${versionId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader }
      });
      if (!res.ok) throw new Error('Failed to restore version');
      notify('Template version restored', 'success');
      await Promise.all([fetchTemplate(), fetchVersions()]);
    } catch (error) {
      notify(error.message || 'Unable to restore version', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
        <Typography variant="h6">Feedback Template</Typography>
        <Chip label={locked ? 'Locked' : 'Editable'} color={locked ? 'error' : 'success'} size="small" />
        <Button variant="contained" onClick={saveTemplate} disabled={locked || saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="outlined" onClick={toggleLock} disabled={lockUpdating}>
          {lockUpdating ? 'Updating...' : locked? 'Unlock' : 'Lock'}
        </Button>
        <Button variant="text" onClick={() => { setVersionsOpen(true); fetchVersions(); }}>
          Versions
        </Button>
      </Box>

      <Box sx={{ display:'flex', gap:2, mb:2 }}>
        <TextField size="small" label="Clone from Event ID" value={sourceEventId} onChange={e=>setSourceEventId(e.target.value)} />
        <Button variant="text" onClick={cloneFrom} disabled={!sourceEventId || locked || cloning}>
          {cloning ? 'Cloning...' : 'Clone'}
        </Button>
      </Box>

      <Divider sx={{ my:2 }} />
      <Button variant="text" onClick={addQuestion} disabled={locked}>+ Add Question</Button>

      {template.map((q) => (
        <Box key={q.questionId} sx={{ border:'1px solid #ddd', borderRadius:1, p:2, my:2 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
            <Typography variant="subtitle2">#{q.order}</Typography>
            <IconButton size="small" onClick={()=>moveQuestion(q.questionId,'up')} disabled={locked}>↑</IconButton>
            <IconButton size="small" onClick={()=>moveQuestion(q.questionId,'down')} disabled={locked}>↓</IconButton>
            <IconButton size="small" onClick={()=>duplicateQuestion(q.questionId)} disabled={locked}><ContentCopyIcon fontSize="small"/></IconButton>
            <IconButton size="small" onClick={()=>removeQuestion(q.questionId)} disabled={locked}><DeleteIcon fontSize="small"/></IconButton>
          </Box>

          <TextField fullWidth sx={{ mt:1 }} label="Question Text" value={q.questionText} onChange={e=>updateField(q.questionId,'questionText', e.target.value)} disabled={locked} />

          <Box sx={{ display:'flex', gap:2, mt:1 }}>
            <Select size="small" value={q.questionType} onChange={e=>updateField(q.questionId,'questionType', e.target.value)} disabled={locked}>
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="rating">Rating (1-5)</MenuItem>
              <MenuItem value="radio">Radio</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
              <MenuItem value="dropdown">Dropdown</MenuItem>
            </Select>
            <FormControlLabel control={<Checkbox checked={q.isRequired} onChange={e=>updateField(q.questionId,'isRequired', e.target.checked)} disabled={locked} />} label="Required" />
          </Box>

          {['radio','checkbox','dropdown'].includes(q.questionType) && (
            <Box sx={{ mt:1 }}>
              <Typography variant="body2">Options</Typography>
              <Button size="small" onClick={()=>addOption(q.questionId)} disabled={locked}>+ Add Option</Button>
              {(q.options||[]).map((opt, idx) => (
                <Box key={idx} sx={{ display:'flex', gap:1, alignItems:'center', my:1 }}>
                  <TextField size="small" value={opt} onChange={e=>updateOption(q.questionId, idx, e.target.value)} disabled={locked} />
                  <Button size="small" onClick={()=>removeOption(q.questionId, idx)} disabled={locked}>Remove</Button>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ))}

      <Dialog open={versionsOpen} onClose={() => setVersionsOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Template Versions</DialogTitle>
        <DialogContent dividers>
          {versionsLoading ? (
            <Box sx={{ display:'flex', justifyContent:'center', p:3 }}>
              <CircularProgress size={32} />
            </Box>
          ) : versions.length === 0 ? (
            <Typography variant="body2">No versions saved yet.</Typography>
          ) : (
            <List>
              {[...versions].reverse().map((version) => (
                <ListItem key={version.versionId} alignItems="flex-start"
                  secondaryAction={
                    <Button
                      size="small"
                      onClick={() => restoreVersion(version.versionId)}
                      disabled={locked || restoringId === version.versionId}
                    >
                      {restoringId === version.versionId ? 'Restoring...' : 'Restore'}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2">
                        {new Date(version.createdAt || Date.now()).toLocaleString()} — {version.notes || 'Snapshot'}
                      </Typography>
                    }
                    secondary={`Saved by ${version.createdBy?.name || version.createdBy?.email || version.createdBy || 'system'}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
