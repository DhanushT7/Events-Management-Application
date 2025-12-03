import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Feedback,
  TrendingUp,
  People,
  CheckCircle,
  Warning,
  Star,
  Visibility,
  Assessment,
  EmojiEvents,
  ExpandMore
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Question mapping for better display
const questionLabels = {
  q7: 'How effectively do you think the organization of this training programme facilitated a conducive learning environment and promoted active participation among participants?',
  q8: 'How effectively did the resource persons communicate and engage with the participants to enhance their learning experience?',
  q9: 'How well do you think the topics covered align with the current trends and challenges, and to what extent did they contribute to your professional development?',
  q10: 'How effective was the presentation style in conveying the key concepts and fostering a dynamic learning environment for the participants?',
  q11: 'Please provide an overall assessment of the program\'s overall effectiveness',
  q12: 'How do you think the training programme could have been more effective? (In 2 lines)',
  q13: 'How satisfied were you overall?',
  q14: 'Would you recommend the workshop to your colleagues or peers?',
  q15: 'Which topics or aspects of the sessions did you find most interesting or useful?'
};

const questionShortLabels = {
  q7: 'Organization & Learning Environment',
  q8: 'Resource Person Communication',
  q9: 'Topic Relevance & Professional Development',
  q10: 'Presentation Style Effectiveness',
  q11: 'Overall Program Assessment',
  q12: 'Improvement Suggestions',
  q13: 'Overall Satisfaction',
  q14: 'Would Recommend to Others',
  q15: 'Most Interesting/Useful Topics'
};

const questionTypes = {
  q7: 'rating',
  q8: 'rating',
  q9: 'rating',
  q10: 'rating',
  q11: 'rating',
  q12: 'text',
  q13: 'rating',
  q14: 'radio',
  q15: 'text'
};

// Question number mapping for display (starting from 1)
const questionNumbers = {
  q7: 1,
  q8: 2,
  q9: 3,
  q10: 4,
  q11: 5,
  q12: 6,
  q13: 7,
  q14: 8,
  q15: 9
};

const FeedbackStatsCard = ({ eventId, userRole = 'coordinator' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [feedbackDetails, setFeedbackDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (eventId) {
      fetchFeedbackStats();
    }
  }, [eventId]);

  const fetchFeedbackStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = userRole === 'hod' ? 'hod' : 'coordinator';
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/${baseUrl}/feedback/stats/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStats(response.data);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      enqueueSnackbar('Error fetching feedback statistics', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackDetails = async () => {
    try {
      setDetailsLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = userRole === 'hod' ? 'hod' : 'coordinator';
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://10.5.12.1:4000/api'}/${baseUrl}/feedback/details/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFeedbackDetails(response.data.feedbacks);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching feedback details:', error);
      enqueueSnackbar('Error fetching feedback details', { variant: 'error' });
    } finally {
      setDetailsLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success.main';
    if (rating >= 3) return 'warning.main';
    return 'error.main';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">No feedback statistics available</Alert>
        </CardContent>
      </Card>
    );
  }

  const { statistics, ratingAnalysis, participantsWithoutFeedback, participantsEligibleForCertificates } = stats;

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Feedback color="primary" />
              <Typography variant="h6">Feedback Statistics</Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Visibility />}
              onClick={fetchFeedbackDetails}
              disabled={statistics.feedbackGivenCount === 0}
            >
              View Details
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Key Metrics */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Participation Overview
              </Typography>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Total Participants</Typography>
                  <Typography variant="h6">{statistics.totalParticipants}</Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Attended</Typography>
                  <Typography variant="h6" color="primary">{statistics.attendedParticipants}</Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Feedback Given</Typography>
                  <Typography variant="h6" color="success.main">{statistics.feedbackGivenCount}</Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Certificates Generated</Typography>
                  <Typography variant="h6" color="info.main">{statistics.certificatesGenerated}</Typography>
                </Box>
              </Box>

              {/* Progress Bars */}
              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Feedback Response Rate: {statistics.feedbackResponseRate}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={statistics.feedbackResponseRate}
                  color={getProgressColor(statistics.feedbackResponseRate)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Certificate Generation Rate: {statistics.certificateGenerationRate}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={statistics.certificateGenerationRate}
                  color={getProgressColor(statistics.certificateGenerationRate)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>

            {/* Rating Analysis */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Feedback Ratings
              </Typography>
              
              {statistics.overallRating > 0 && (
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography variant="h4" color={getRatingColor(statistics.overallRating)}>
                    {statistics.overallRating}
                  </Typography>
                  <Box>
                    <Rating value={statistics.overallRating} readOnly precision={0.1} />
                    <Typography variant="body2" color="text.secondary">
                      Overall Rating
                    </Typography>
                  </Box>
                </Box>
              )}

              {Object.keys(ratingAnalysis).length > 0 && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Question Ratings:
                  </Typography>
                  {Object.entries(ratingAnalysis).map(([question, analysis]) => (
                    <Box key={question} mb={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Tooltip title={questionLabels[question] || question}>
                          <Typography variant="body2" color="text.secondary" sx={{ cursor: 'help' }}>
                            Question {questionNumbers[question]}
                          </Typography>
                        </Tooltip>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {analysis.average}
                          </Typography>
                          {questionTypes[question] === 'rating' && (
                            <Rating value={analysis.average} readOnly size="small" precision={0.1} />
                          )}
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {questionShortLabels[question] || question} ({analysis.totalResponses} responses)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Action Items */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                {participantsWithoutFeedback.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Pending Feedback ({participantsWithoutFeedback.length})
                      </Typography>
                      <Typography variant="body2">
                        {participantsWithoutFeedback.length} participants who attended haven't submitted feedback yet.
                      </Typography>
                    </Alert>
                  </Grid>
                )}

                {participantsEligibleForCertificates.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Certificate Eligible ({participantsEligibleForCertificates.length})
                      </Typography>
                      <Typography variant="body2">
                        {participantsEligibleForCertificates.length} participants are eligible for certificate generation.
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Enhanced Feedback Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Assessment color="primary" />
            Detailed Feedback Responses
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {detailsLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Summary Stats */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Response Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{feedbackDetails.length}</Typography>
                      <Typography variant="body2">Total Responses</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">{statistics.overallRating}</Typography>
                      <Typography variant="body2">Average Rating</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">{statistics.feedbackResponseRate}%</Typography>
                      <Typography variant="body2">Response Rate</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">{statistics.certificatesGenerated}</Typography>
                      <Typography variant="body2">Certificates</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Question-wise Analysis */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Question-wise Analysis
                </Typography>
                {Object.entries(ratingAnalysis).map(([question, analysis]) => (
                  <Accordion key={question}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center" gap={2} width="100%">
                        <Typography variant="subtitle1" fontWeight="bold">
                          Question {questionNumbers[question]}
                        </Typography>
                        <Box flexGrow={1} />
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {analysis.average}
                          </Typography>
                          {questionTypes[question] === 'rating' && (
                            <Rating value={analysis.average} readOnly size="small" precision={0.1} />
                          )}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {questionLabels[question]}
                      </Typography>
                      <Box display="flex" gap={2} mt={2}>
                        <Typography variant="body2">
                          <strong>Average:</strong> {analysis.average}/5
                        </Typography>
                        <Typography variant="body2">
                          <strong>Responses:</strong> {analysis.totalResponses}
                        </Typography>
                      </Box>
                      {analysis.distribution && (
                        <Box mt={2}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Rating Distribution:</strong>
                          </Typography>
                          <Box display="flex" gap={2}>
                            {Object.entries(analysis.distribution).map(([rating, count]) => (
                              <Chip
                                key={rating}
                                label={`${rating}★: ${count}`}
                                size="small"
                                color={rating >= 4 ? 'success' : rating >= 3 ? 'warning' : 'error'}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>

              {/* Individual Responses */}
              <Typography variant="h6" gutterBottom>
                Individual Responses
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Participant</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell>All Responses</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feedbackDetails.map((feedback, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {feedback.participant.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {feedback.participant.email}
                          </Typography>
                        </TableCell>
                        <TableCell>{feedback.participant.department}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(feedback.submittedAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {Object.entries(feedback.responses).map(([question, response]) => (
                              <Tooltip 
                                key={question} 
                                title={`${questionShortLabels[question]}: ${response}${questionTypes[question] === 'rating' ? '/5' : ''}`}
                              >
                                <Chip
                                  label={`Q${questionNumbers[question]}: ${response}`}
                                  size="small"
                                  color={
                                    questionTypes[question] === 'rating' 
                                      ? (response >= 4 ? 'success' : response >= 3 ? 'warning' : 'error')
                                      : 'default'
                                  }
                                  variant="outlined"
                                />
                              </Tooltip>
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeedbackStatsCard;