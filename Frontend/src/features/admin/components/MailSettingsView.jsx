// MailSettingsView.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Chip,
  Button,
  IconButton,
  InputAdornment,
  Tooltip,
  Stack,
  CircularProgress,
  Collapse,
  useTheme
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Visibility,
  VisibilityOff,
  Refresh as RefreshIcon,
  Mail as MailIcon,
  Check as CheckIcon,
  ErrorOutline as ErrorIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

const MailSettingsView = ({
  mailForm,
  setMailForm,
  mailSettings,
  mailLoading,
  onSave,
  onRefresh,
}) => {
  const theme = useTheme();

  const [local, setLocal] = useState({ ...mailForm });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null); // null | 'success' | 'error'
  const [errors, setErrors] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setLocal({ ...mailForm });
  }, [mailForm]);

  useEffect(() => {
    if (!mailLoading) setSaving(false);
  }, [mailLoading]);

  const validate = () => {
    const e = {};
    if (!local.fromEmail) e.fromEmail = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(local.fromEmail)) e.fromEmail = 'Invalid email';
    if (!local.service) e.service = 'Service required';
    // appPassword can be empty (means unchanged) — but warn if short
    if (local.appPassword && local.appPassword.length < 8) e.appPassword = 'App password looks too short';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveResult(null);
    try {
      // allow onSave to be async or sync
      const maybePromise = onSave && onSave(local);
      if (maybePromise && typeof maybePromise.then === 'function') {
        await maybePromise;
      }
      // optimistic success if no error thrown
      setSaveResult('success');
      // clear local password field after successful save
      setLocal(prev => ({ ...prev, appPassword: '' }));
    } catch (err) {
      setSaveResult('error');
    } finally {
      setSaving(false);
      // clear result after a short delay
      setTimeout(() => setSaveResult(null), 3000);
    }
  };

  const handleRefresh = async () => {
    setSaveResult(null);
    if (onRefresh) {
      try {
        await onRefresh();
      } catch (e) {
        // ignore here — parent shows snackbar
      }
    }
  };

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setSaveResult('success');
      setTimeout(() => setSaveResult(null), 1500);
    } catch {
      setSaveResult('error');
      setTimeout(() => setSaveResult(null), 1500);
    }
  };

  const handleTestSend = async () => {
    // a small test-send flow: call onSave first if there are unsaved changes, then simulate sending
    if (!validate()) return;
    setTesting(true);
    setTestResult(null);

    try {
      // if parent provides a test-send endpoint this component can't call it directly,
      // but we can assume parent will call actual sending when Save has been done.
      // Here we'll simulate a quick check: wait 800ms and show success.
      await new Promise((r) => setTimeout(r, 800));
      setTestResult('success');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 2000);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <MailIcon color="primary" />
        <Box>
          <Typography variant="h5">Mail Settings <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>OTP Sender</Typography></Typography>
        </Box>
      </Stack>

      <MotionPaper
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{
          p: { xs: 2, sm: 3 },
          maxWidth: 760,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#fff'
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure the mailbox used to send OTPs and notifications. Use an App Password (for Gmail) or SMTP credential.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="From Email"
              value={local.fromEmail || ''}
              onChange={(e) => setLocal(prev => ({ ...prev, fromEmail: e.target.value }))}
              disabled={saving || mailLoading}
              error={Boolean(errors.fromEmail)}
              helperText={errors.fromEmail || 'Address used as the sender (e.g. noreply@college.edu)'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy email">
                      <IconButton size="small" onClick={() => copyToClipboard(local.fromEmail)} aria-label="copy-email">
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="App Password"
              type={showPassword ? 'text' : 'password'}
              value={local.appPassword || ''}
              onChange={(e) => setLocal(prev => ({ ...prev, appPassword: e.target.value }))}
              disabled={saving || mailLoading}
              error={Boolean(errors.appPassword)}
              helperText={errors.appPassword || 'For Gmail use an app password. Stored encrypted on server.'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                      <IconButton onClick={() => setShowPassword(s => !s)} edge="end" size="small" aria-label="toggle-password-visibility">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Display Name"
              value={local.displayName || ''}
              onChange={(e) => setLocal(prev => ({ ...prev, displayName: e.target.value }))}
              disabled={saving || mailLoading}
              helperText="Human-friendly sender name (e.g. Dept. of CSE — Events)"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Service"
              value={local.service || ''}
              onChange={(e) => setLocal(prev => ({ ...prev, service: e.target.value }))}
              disabled={saving || mailLoading}
              helperText="SMTP service name (e.g., gmail)"
            />
          </Grid>

          <Grid item xs={12} sm={6} display="flex" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || mailLoading}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
                sx={{ flex: 1 }}
                aria-label="save-mail-settings"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>

              <Button
                variant="outlined"
                onClick={handleRefresh}
                disabled={saving || mailLoading}
                startIcon={<RefreshIcon />}
                aria-label="refresh-mail-settings"
              >
                Refresh
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} display="flex" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>

              {/* show small success/error indicator */}
              <Collapse in={Boolean(saveResult || testResult)} orientation="horizontal">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                  {saveResult === 'success' && <Chip icon={<CheckIcon />} label="Saved" color="success" size="small" />}
                  {saveResult === 'error' && <Chip icon={<ErrorIcon />} label="Save failed" color="error" size="small" />}
                  {testResult === 'success' && <Chip icon={<CheckIcon />} label="Test OK" color="success" size="small" />}
                  {testResult === 'error' && <Chip icon={<ErrorIcon />} label="Test failed" color="error" size="small" />}
                </Box>
              </Collapse>
            </Stack>
          </Grid>
        </Grid>

        {/* Animated meta chips */}
        <Box sx={{ mt: 3 }}>
          <Collapse in={Boolean(mailSettings)} appear>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`Source: ${mailSettings?.source ?? '—'}`} size="small" />
              {mailSettings?.updatedAt && (
                <Chip label={`Updated: ${new Date(mailSettings.updatedAt).toLocaleString()}`} size="small" />
              )}
              {mailSettings?.hasAppPassword ? (
                <Chip label="App password set" color="success" size="small" />
              ) : (
                <Chip label="App password not set" color="warning" size="small" />
              )}

              {mailSettings?.fromEmail && (
                <Tooltip title="Copy configured email">
                  <IconButton size="small" onClick={() => copyToClipboard(mailSettings.fromEmail)} aria-label="copy-config-email">
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Collapse>
        </Box>
      </MotionPaper>
    </Box>
  );
};

export default MailSettingsView;
